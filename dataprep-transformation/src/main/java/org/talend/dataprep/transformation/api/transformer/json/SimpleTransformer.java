package org.talend.dataprep.transformation.api.transformer.json;

import static java.util.stream.StreamSupport.stream;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.spark.SparkContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.dataset.*;
import org.talend.dataprep.api.type.TypeUtils;
import org.talend.dataprep.exception.TDPException;
import org.talend.dataprep.transformation.api.action.ActionParser;
import org.talend.dataprep.transformation.api.action.DataSetMetadataAction;
import org.talend.dataprep.transformation.api.action.DataSetRowAction;
import org.talend.dataprep.transformation.api.action.ParsedActions;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.transformer.Transformer;
import org.talend.dataprep.transformation.api.transformer.TransformerWriter;
import org.talend.dataprep.transformation.api.transformer.configuration.Configuration;
import org.talend.dataprep.transformation.exception.TransformationErrorCodes;
import org.talend.dataquality.semantic.recognizer.CategoryRecognizerBuilder;
import org.talend.datascience.common.inference.Analyzer;
import org.talend.datascience.common.inference.Analyzers;
import org.talend.datascience.common.inference.quality.ValueQuality;
import org.talend.datascience.common.inference.quality.ValueQualityAnalyzer;
import org.talend.datascience.common.inference.semantic.SemanticAnalyzer;
import org.talend.datascience.common.inference.semantic.SemanticType;
import org.talend.datascience.common.inference.type.DataType;

/**
 * Base implementation of the Transformer interface.
 */
@Component
class SimpleTransformer implements Transformer {

    /** The data-prep jackson builder. */
    @Autowired
    private Jackson2ObjectMapperBuilder builder;

    @Autowired
    ActionParser actionParser;

    @Autowired
    SparkContext sparkContext;
    
    /**
     * @see Transformer#transform(DataSet, Configuration)
     */
    @Override
    public void transform(DataSet input, Configuration configuration) {
        if (input == null) {
            throw new IllegalArgumentException("Input cannot be null.");
        }
        final TransformerWriter writer = configuration.writer();
        try {
            writer.startObject();
            final ParsedActions parsedActions = actionParser.parse(configuration.getActions());
            final List<DataSetMetadataAction> metadataActions = parsedActions.getMetadataTransformers();
            final List<DataSetRowAction> rowActions = parsedActions.getRowTransformers();
            final boolean transformColumns = !input.getColumns().isEmpty();
            TransformationContext context = configuration.getTransformationContext();
            // Metadata transformation
            RowMetadata rowMetadata = new RowMetadata(input.getColumns());
            if (transformColumns) {
                for (DataSetMetadataAction action : metadataActions) {
                    action.accept(rowMetadata, context);
                }
                context.setTransformedRowMetadata(rowMetadata);
                if (writer.requireMetadataForHeader()) {
                    writer.fieldName("columns");
                    writer.write(rowMetadata);
                }
            } else {
                context.setTransformedRowMetadata(rowMetadata);
            }
            // Row transformations
            Stream<DataSetRow> records = input.getRecords();
            writer.fieldName("records");
            writer.startArray();
            // Apply actions to records
            for (DataSetRowAction action : rowActions) {
                records = records.map(r -> {
                    action.accept(r, context);
                    return r;
                });
            }
            // Configure quality & semantic analysis (if column metadata information is present in stream).
            final DataType.Type[] types = TypeUtils.convert(context.getTransformedRowMetadata().getColumns());
            final URI ddPath = this.getClass().getResource("/luceneIdx/dictionary").toURI(); //$NON-NLS-1$
            final URI kwPath = this.getClass().getResource("/luceneIdx/keyword").toURI(); //$NON-NLS-1$
            final CategoryRecognizerBuilder categoryBuilder = CategoryRecognizerBuilder.newBuilder() //
                    .ddPath(ddPath) //
                    .kwPath(kwPath) //
                    .setMode(CategoryRecognizerBuilder.Mode.LUCENE);
            final Analyzer<Analyzers.Result> analyzer = Analyzers.with(new ValueQualityAnalyzer(types), new SemanticAnalyzer(
                    categoryBuilder));
            if (types.length > 0) {
                records = records.map(r -> {
                    if (!r.isDeleted()) {
                        final List<ColumnMetadata> columns = context.getTransformedRowMetadata().getColumns();
                        final Map<String, Object> rowValues = r.order(columns).values();
                        final List<String> strings = stream(rowValues.values().spliterator(), false) //
                                .map(String::valueOf) //
                                .collect(Collectors.<String>toList());
                        analyzer.analyze(strings.toArray(new String[strings.size()]));
                    }
                    return r;
                });
            }
            // Write transformed records to stream
            List<DataSetRow> transformedRows = new ArrayList<>();
            records.forEach(row -> {
                if (!row.isDeleted()) {
                    // Clone original value since row instance is reused.
                    transformedRows.add(row.order(context.getTransformedRowMetadata().getColumns()));
                }
                try {
                    if (row.shouldWrite()) {
                        writer.write(row);
                    }
                } catch (IOException e) {
                    throw new TDPException(TransformationErrorCodes.UNABLE_TRANSFORM_DATASET, e);
                }
            });
            // Column statistics
            if (transformColumns) {
                // Spark statistics
                final DataSet statisticsDataSet = new DataSet();
                final DataSetMetadata transformedMetadata = new DataSetMetadata("", //
                        "", //
                        "", //
                        0, //
                        rowMetadata);
                transformedMetadata.getContent().setNbRecords(transformedRows.size());
                statisticsDataSet.setMetadata(transformedMetadata);
                statisticsDataSet.setRecords(transformedRows.stream());
                DataSetAnalysis.computeStatistics(statisticsDataSet, sparkContext, builder);
                // Set new quality information in transformed column metadata
                final List<Analyzers.Result> results = analyzer.getResult();
                final List<ColumnMetadata> dataSetColumns = context.getTransformedRowMetadata().getColumns();
                for (int i = 0; i < results.size(); i++) {
                    final Analyzers.Result result = results.get(i);
                    final ColumnMetadata metadata = dataSetColumns.get(i);
                    // Value quality
                    final ValueQuality column = result.get(ValueQuality.class);
                    final Quality quality = metadata.getQuality();
                    quality.setEmpty((int) column.getEmptyCount());
                    quality.setInvalid((int) column.getInvalidCount());
                    quality.setValid((int) column.getValidCount());
                    // Semantic types
                    final SemanticType semanticType = result.get(SemanticType.class);
                    metadata.setDomain(semanticType.getSuggestedCategory());
                }
            }
            writer.endArray();
            // Write columns
            if (!writer.requireMetadataForHeader() && transformColumns) {
                writer.fieldName("columns");
                writer.write(rowMetadata);
            }
            writer.endObject();
            writer.flush();
        } catch (IOException | URISyntaxException e) {
            throw new TDPException(TransformationErrorCodes.UNABLE_TRANSFORM_DATASET, e);
        }
    }

    @Override
    public boolean accept(Configuration configuration) {
        return Configuration.class.equals(configuration.getClass()) && configuration.volume() == Configuration.Volume.SMALL;
    }

}
