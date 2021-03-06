// ============================================================================
// Copyright (C) 2006-2018 Talend Inc. - www.talend.com
//
// This source code is available under agreement available at
// https://github.com/Talend/data-prep/blob/master/LICENSE
//
// You should have received a copy of the agreement
// along with this program; if not, write to Talend SA
// 9 rue Pages 92150 Suresnes, France
//
// ============================================================================

package org.talend.dataprep.cache;

import static java.util.Collections.emptyMap;
import static org.talend.dataprep.api.export.ExportParameters.SourceType.HEAD;

import java.util.Comparator;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.talend.dataprep.api.export.ExportParameters;
import org.talend.dataprep.api.export.ExportParameters.SourceType;
import org.talend.dataprep.security.Security;

/**
 * Generate cache key
 */
@Component
public class CacheKeyGenerator {

    @Autowired
    private Security security;

    /**
     * Build a cache key for dataset-sample
     * @param datasetId the id of the dataset
     * @return the cache key of the dataset sample
     */
    public DataSetSampleCacheKey generateDatasetSampleKey(final String datasetId) {
        return new DataSetSampleCacheKey(datasetId);
    }

    /**
     * Build a cache key to identify the transformation result content
     */
    public TransformationCacheKey generateContentKey(final String datasetId, final String preparationId, //
            final String stepId, final String format, final SourceType sourceType, final String filter) {
        return this.generateContentKey(datasetId, preparationId, stepId, format, sourceType, emptyMap(), filter);
    }

    /**
     * Build a cache key from ExportParameter
     */
    public TransformationCacheKey generateContentKey(final ExportParameters parameters) {

        final String stepId = parameters.getStepId();
        final String preparationId = parameters.getPreparationId();
        final String format = parameters.getExportType();
        final String dataSetId = parameters.getDatasetId();
        final String filter = parameters.getFilter();
        final SourceType sourceType = parameters.getFrom();
        final Map<String, String> arguments = parameters.getArguments();

        return this.generateContentKey(dataSetId, preparationId, stepId, format, sourceType, arguments, filter);
    }

    /**
     *
     * Build a cache key with additional parameters
     * When source type is HEAD, the user id is not included in cache key, as the HEAD sample is common for all users
     *
     * @param datasetId the dataset id.
     * @param preparationId the preparation id.
     * @param stepId the step id.
     * @param format the format (csv, excel...)
     * @param sourceType where the data comes from.
     * @param parameters the parameters.
     * @param filter the applied filters.
     * @return the transformation cache key to use.
     */
    public TransformationCacheKey generateContentKey(final String datasetId, //
            final String preparationId, //
            final String stepId, //
            final String format, //
            final SourceType sourceType, //
            final Map<String, String> parameters, //
            final String filter) {

        final String actualParameters = parameters == null ? StringUtils.EMPTY
                : parameters
                        .entrySet()
                        .stream() //
                        .sorted(Comparator.comparing(Map.Entry::getKey)) //
                        .map(Map.Entry::getValue) //
                        .reduce((s1, s2) -> s1 + s2) //
                        .orElse(StringUtils.EMPTY);
        final SourceType actualSourceType = sourceType == null ? HEAD : sourceType;
        final String actualUserId = actualSourceType == HEAD ? null : security.getUserId();

        final String actualFilter = filter == null ? "" : filter;

        return new TransformationCacheKey( //
                preparationId, //
                datasetId, //
                format, //
                stepId, //
                actualParameters, //
                actualSourceType, //
                actualUserId, //
                actualFilter //
        );
    }

    /**
     * Build a metadata cache key to identify the transformation result content
     * When source type is HEAD, the user id is not included in cache key, as the HEAD sample is common for all users
     */
    public TransformationMetadataCacheKey generateMetadataKey(final String preparationId, final String stepId,
            final SourceType sourceType) {
        final SourceType actualSourceType = sourceType == null ? HEAD : sourceType;
        final String actualUserId = actualSourceType == HEAD ? null : security.getUserId();

        return new TransformationMetadataCacheKey(preparationId, stepId, actualSourceType, actualUserId);
    }

    /**
     * @return a builder for metadata cache key
     */
    public MetadataCacheKeyBuilder metadataBuilder() {
        return new MetadataCacheKeyBuilder(this);
    }

    /**
     * @return a builder for content cache key
     */
    public ContentCacheKeyBuilder contentBuilder() {
        return new ContentCacheKeyBuilder(this);
    }

    public class MetadataCacheKeyBuilder {

        private String preparationId;

        private String stepId;

        private SourceType sourceType;

        private CacheKeyGenerator cacheKeyGenerator;

        private MetadataCacheKeyBuilder(final CacheKeyGenerator cacheKeyGenerator) {
            this.cacheKeyGenerator = cacheKeyGenerator;
        }

        public MetadataCacheKeyBuilder preparationId(final String preparationId) {
            this.preparationId = preparationId;
            return this;
        }

        public MetadataCacheKeyBuilder stepId(final String stepId) {
            this.stepId = stepId;
            return this;
        }

        public MetadataCacheKeyBuilder sourceType(final SourceType sourceType) {
            this.sourceType = sourceType;
            return this;
        }

        public TransformationMetadataCacheKey build() {
            return cacheKeyGenerator.generateMetadataKey(preparationId, stepId, sourceType);
        }
    }

    public class ContentCacheKeyBuilder {

        private String datasetId;

        private String format;

        private Map<String, String> parameters;

        private String preparationId;

        private String stepId;

        private SourceType sourceType;

        private String filter;

        private CacheKeyGenerator cacheKeyGenerator;

        private ContentCacheKeyBuilder(final CacheKeyGenerator cacheKeyGenerator) {
            this.cacheKeyGenerator = cacheKeyGenerator;
        }

        public ContentCacheKeyBuilder preparationId(final String preparationId) {
            this.preparationId = preparationId;
            return this;
        }

        public ContentCacheKeyBuilder stepId(final String stepId) {
            this.stepId = stepId;
            return this;
        }

        public ContentCacheKeyBuilder sourceType(final SourceType sourceType) {
            this.sourceType = sourceType;
            return this;
        }

        public ContentCacheKeyBuilder datasetId(final String datasetId) {
            this.datasetId = datasetId;
            return this;
        }

        public ContentCacheKeyBuilder format(final String format) {
            this.format = format;
            return this;
        }

        public ContentCacheKeyBuilder parameters(final Map<String, String> parameters) {
            this.parameters = parameters;
            return this;
        }

        public ContentCacheKeyBuilder filter(final String filter) {
            this.filter = filter;
            return this;
        }

        public TransformationCacheKey build() {
            return cacheKeyGenerator.generateContentKey( //
                    datasetId, preparationId, stepId, //
                    format, sourceType, parameters, filter);
        }
    }
}
