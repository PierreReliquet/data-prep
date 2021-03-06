// ============================================================================
//
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

package org.talend.dataprep.transformation.format;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.dataset.row.DataSetRow;
import org.talend.dataprep.api.type.Type;

/**
 * Unit test for the JsonWriter.
 *
 * @JsonWriter
 */
public class JsonWriterTest extends BaseFormatTest {

    /** The writer to test. */
    private JsonWriter writer;

    /** Where the writer should write. */
    private ByteArrayOutputStream outputStream;

    @Before
    public void init() {
        outputStream = new ByteArrayOutputStream();
        writer = (JsonWriter) context.getBean("writer#JSON", outputStream);
    }

    @Test
    public void shouldWriteColumns() throws Exception {
        // given
        final ColumnMetadata column1 = ColumnMetadata.Builder.column().id(1).name("id").type(Type.STRING).build();
        final ColumnMetadata column2 =
                ColumnMetadata.Builder.column().id(2).name("firstname").type(Type.STRING).build();

        final List<ColumnMetadata> columns = new ArrayList<>(2);
        columns.add(column1);
        columns.add(column2);

        String expectedOutput =
                IOUtils.toString(JsonWriterTest.class.getResourceAsStream("expected_columns.json"), UTF_8);

        // when
        writer.write(new RowMetadata(columns));
        writer.close();

        // then
        assertThat(new String(outputStream.toByteArray()), sameJSONAs(expectedOutput).allowingExtraUnexpectedFields());
    }

    @Test
    public void shouldWriteRowWithTdpId() throws IOException {
        // given
        Map<String, String> values = new HashMap<String, String>() {

            {
                put("id", "64a5456ac148b64524ef165");
                put("firstname", "Superman");
            }
        };
        final DataSetRow row = new DataSetRow(values);
        row.setTdpId(23L);

        final String expectedJson =
                "{\"records\":[{\"firstname\":\"Superman\",\"id\":\"64a5456ac148b64524ef165\",\"tdpId\":23}]}";

        // when
        writer.write(row);
        writer.close();

        // then
        assertThat(new String(outputStream.toByteArray()), is(expectedJson));
    }

    @Test
    public void shouldWriteMetadataAndRecords() throws IOException {
        // given
        // metadata
        final ColumnMetadata column1 = ColumnMetadata.Builder.column().id(1).name("id").type(Type.STRING).build();
        final ColumnMetadata column2 =
                ColumnMetadata.Builder.column().id(2).name("firstname").type(Type.STRING).build();

        final List<ColumnMetadata> columns = new ArrayList<>(2);
        columns.add(column1);
        columns.add(column2);

        // rows
        Map<String, String> values = new HashMap<String, String>() {

            {
                put("id", "64a5456ac148b64524ef165");
                put("firstname", "Superman");
            }
        };
        final DataSetRow row = new DataSetRow(values);
        row.setTdpId(23L);

        Map<String, String> valuesRow2 = new HashMap<String, String>() {

            {
                put("id", "b4a5456ac148b64524ef165");
                put("firstname", "Batman");
            }
        };
        final DataSetRow row2 = new DataSetRow(valuesRow2);
        row2.setTdpId(42L);

        RowMetadata rowMetadata = new RowMetadata(columns);
        rowMetadata.setSampleNbRows(2);

        final String expectedJson = IOUtils
                .toString(this.getClass().getResourceAsStream("expected_json_with_row_and_metadata.json"), UTF_8);

        // when
        writer.write(row);
        writer.write(rowMetadata);
        writer.write(row2);
        writer.close();

        // then
        assertThat(new String(outputStream.toByteArray()), sameJSONAs(expectedJson));
    }
}
