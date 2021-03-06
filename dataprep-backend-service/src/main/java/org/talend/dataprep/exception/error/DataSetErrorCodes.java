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

package org.talend.dataprep.exception.error;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.MOVED_PERMANENTLY;
import static org.springframework.http.HttpStatus.NOT_ACCEPTABLE;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.PAYLOAD_TOO_LARGE;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.talend.daikon.exception.error.ErrorCode;
import org.talend.dataprep.api.dataset.DataSetLifecycle;

/**
 * DataSet error codes.
 */
public enum DataSetErrorCodes implements ErrorCode {
    UNEXPECTED_IO_EXCEPTION(INTERNAL_SERVER_ERROR),
    UNABLE_TO_READ_DATASET_CONTENT(INTERNAL_SERVER_ERROR),
    UNABLE_TO_READ_REMOTE_DATASET_CONTENT(NOT_FOUND),
    UNEXPECTED_JMS_EXCEPTION(INTERNAL_SERVER_ERROR),
    UNABLE_TO_CLEAR_DATASETS(INTERNAL_SERVER_ERROR),
    UNABLE_TO_DELETE_DATASET(BAD_REQUEST, "dataSetId"),
    UNABLE_TO_STORE_DATASET_CONTENT(INTERNAL_SERVER_ERROR, "id"),
    UNABLE_TO_ANALYZE_COLUMN_TYPES(INTERNAL_SERVER_ERROR),
    UNABLE_TO_ANALYZE_DATASET_QUALITY(INTERNAL_SERVER_ERROR),
    /**
     * Error returned in case the data set is in "importing" state,
     * meaning all mandatory analysis prevents service to correctly
     * serve data set's content.
     *
     * @see DataSetLifecycle#isImporting()
     */
    UNABLE_TO_SERVE_DATASET_CONTENT(BAD_REQUEST, "id"),
    /**
     * this one will happen when user do something on data whereas the
     * data has been updated async in the backend and this action is not
     * possible anymore (i.e preview whereas this dataset do not need
     * any preview)
     */
    REDIRECT_CONTENT(MOVED_PERMANENTLY),
    /**
     * Error returned in case user tries to access to a data set that
     * does not exist (or no longer exists).
     */
    DATASET_DOES_NOT_EXIST(NOT_FOUND, "id"),
    /**
     * Error returned when the json that contains the dataset location
     * cannot be parsed.
     */
    UNABLE_TO_READ_DATASET_LOCATION(BAD_REQUEST),
    /**
     * Error returned in case user tries to access to a column that does
     * not exist (or no longer exists) for a data set.
     */
    COLUMN_DOES_NOT_EXIST(BAD_REQUEST, "id"),
    /**
     * Error returned when the order is not supported.
     */
    ILLEGAL_ORDER_FOR_LIST(BAD_REQUEST, "order"),
    /**
     * Error returned when the sort is not supported.
     */
    ILLEGAL_SORT_FOR_LIST(BAD_REQUEST, "sort"),
    /**
     * Error returned when the dataset metadata could not be saved.
     */
    UNABLE_TO_STORE_DATASET_METADATA(INTERNAL_SERVER_ERROR, "id"),
    /**
     * Error returned when the dataset metadata could not be read.
     */
    UNABLE_TO_READ_DATASET_METADATA(INTERNAL_SERVER_ERROR, "id"),
    /**
     * This dataset name is already used
     */
    DATASET_NAME_ALREADY_USED(CONFLICT, "id", "name", "folder"),
    /**
     * Error return when the uploaded content is not supported by any
     * {@link org.talend.dataprep.schema.CompositeFormatDetector guesser}.
     */
    UNSUPPORTED_CONTENT(BAD_REQUEST),

    /**
     * Error returned when the encoding of the uploaded content is not supported.
     */
    UNSUPPORTED_ENCODING(BAD_REQUEST),
    /**
     * Error return when the uploaded content is mal formatted .
     */
    MALFORMATED_CONTENT(BAD_REQUEST),
    /**
     * Error returned when there's an error fetching the list of
     * supported encodings.
     */
    UNABLE_TO_LIST_SUPPORTED_ENCODINGS(INTERNAL_SERVER_ERROR),
    /**
     * Error returned when there's an error fetching the list of possible imports.
     */
    UNABLE_TO_LIST_SUPPORTED_IMPORTS(INTERNAL_SERVER_ERROR),
    /**
     * Error thrown when a folder is... not... found !
     */
    FOLDER_NOT_FOUND(NOT_FOUND, "path"),
    /** Error returned in case user tries to access to a folder that does not exist (or no longer exists). */
    FOLDER_DOES_NOT_EXIST(BAD_REQUEST, "id"),
    /**
     * Error thrown when a problem occurred while listing folder children.
     */
    UNABLE_TO_LIST_FOLDER_CHILDREN(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder could not be added.
     */
    UNABLE_TO_ADD_FOLDER(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder could not be added.
     */
    ILLEGAL_FOLDER_NAME(BAD_REQUEST, "name"),
    /**
     * Error thrown when a folder could not be added.
     */
    UNABLE_TO_RENAME_FOLDER(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder entry could not be added.
     */
    UNABLE_TO_ADD_FOLDER_ENTRY(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder entry could not be removed.
     */
    UNABLE_TO_REMOVE_FOLDER_ENTRY(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder could not be removed.
     */
    UNABLE_TO_DELETE_FOLDER(INTERNAL_SERVER_ERROR, "path"),
    /**
     * Error thrown when a folder entry could not be moved.
     */
    UNABLE_TO_MOVE_FOLDER_ENTRY(INTERNAL_SERVER_ERROR),
    /**
     * Error thrown when folder entries could not be listed.
     */
    UNABLE_TO_LIST_FOLDER_ENTRIES(INTERNAL_SERVER_ERROR, "path", "type"),
    /**
     * Error thrown when a folder entry could not be read.
     */
    UNABLE_TO_READ_FOLDER_ENTRY(INTERNAL_SERVER_ERROR, "path", "type"),
    /**
     * Error thrown when not able to receive content from a job.
     */
    UNABLE_TO_RECEIVE_CONTENT(INTERNAL_SERVER_ERROR),
    /**
     * Error thrown when data prep fails to create a new data set.
     */
    UNABLE_CREATE_DATASET(INTERNAL_SERVER_ERROR),
    /**
     * Error thrown when an error occurs while adding or updating a dataset.
     */
    UNABLE_TO_CREATE_OR_UPDATE_DATASET(INTERNAL_SERVER_ERROR),
    /**
     * The dataset has too many column to process in DataPrep. This would cause memory issues.
     */
    DATASET_HAS_TOO_MANY_COLUMNS(BAD_REQUEST, "number-of-columns", "max-allowed"),
    /**
     * A dataSet used by a preparation with a given name not found.
     */
    PREPARATION_DATASET_NOT_FOUND(NOT_FOUND, "name"),
    /**
     * A lookup dataSet used by a preparation with a given name not found.
     */
    PREPARATION_LOOKUP_NOT_FOUND(NOT_FOUND, "name"),
    /**
     * A dataSet used by a preparation with a given name have not the expected format.
     */
    PREPARATION_DATASET_BAD_FORMAT(NOT_ACCEPTABLE, "name"),
    /**
     * A lookup dataSet used by a preparation with a given name have not the expected format.
     */
    PREPARATION_LOOKUP_BAD_FORMAT(NOT_ACCEPTABLE, "name"),
    /**
     * A user tries to run a live dataset without any TIC access.
     */
    UNAUTHORIZED_ACCESS_TO_TIC(BAD_GATEWAY),
    /**
     * A lookup dataSet used by a preparation with a given name have not the expected format.
     */
    INVALID_DATASET_NAME(BAD_REQUEST, "name"),
    /**
     * A create operation on a dataset lead to exceeding storage quota.
     */
    MAX_STORAGE_MAY_BE_EXCEEDED(PAYLOAD_TOO_LARGE, "limit");

    /**
     * The http status to use.
     */
    private int httpStatus;

    /**
     * Expected entries to be in the context.
     */
    private List<String> expectedContextEntries;

    /**
     * default constructor.
     *
     * @param httpStatus the http status to use.
     */
    DataSetErrorCodes(HttpStatus httpStatus) {
        this.httpStatus = httpStatus.value();
        this.expectedContextEntries = Collections.emptyList();
    }

    /**
     * default constructor.
     *
     * @param httpStatus     the http status to use.
     * @param contextEntries expected context entries.
     */
    DataSetErrorCodes(HttpStatus httpStatus, String... contextEntries) {
        this.httpStatus = httpStatus.value();
        this.expectedContextEntries = Arrays.asList(contextEntries);
    }

    /**
     * @return the product.
     */
    @Override
    public String getProduct() {
        return "TDP"; //$NON-NLS-1$
    }

    /**
     * @return the group.
     */
    @Override
    public String getGroup() {
        return "DSS"; //$NON-NLS-1$
    }

    /**
     * @return the http status.
     */
    @Override
    public int getHttpStatus() {
        return httpStatus;
    }

    /**
     * @return the expected context entries.
     */
    @Override
    public Collection<String> getExpectedContextEntries() {
        return expectedContextEntries;
    }

    @Override
    public String getCode() {
        return this.toString();
    }
}
