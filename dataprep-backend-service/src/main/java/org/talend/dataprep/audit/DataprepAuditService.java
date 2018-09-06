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

package org.talend.dataprep.audit;

import java.util.*;

import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.autoconfigure.condition.*;
import org.springframework.stereotype.*;
import org.talend.logging.audit.*;

@Component
@ConditionalOnProperty(name = "audit.log.enabled", havingValue = "true")
public class DataprepAuditService implements BaseDataprepAuditService {

    private static final String PREPARATION_NAME_CONTEXT_KEY = "preparationName";

    private static final String PREPARATION_ID_CONTEXT_KEY = "preparationId";

    private static final String DATASET_NAME_CONTEXT_KEY = "datasetName";

    private static final String DATASET_ID_CONTEXT_KEY = "datasetId";

    private static final String FOLDER_ID_CONTEXT_KEY = "folderId";

    private static final String FOLDER_NAME_CONTEXT_KEY = "folderName";

    @Autowired
    private DataprepEventAuditLogger auditLogger;

    public void auditPreparationCreation(String prepName, String prepId, String datasetName, String datasetId,
            String folderId) {
        ContextBuilder builder = ContextBuilder
                .create()
                .with(PREPARATION_NAME_CONTEXT_KEY, prepName)
                .with(PREPARATION_ID_CONTEXT_KEY, prepId)
                .with(DATASET_ID_CONTEXT_KEY, datasetId)
                .with(FOLDER_ID_CONTEXT_KEY, folderId);
        if (datasetName != null) {
            builder.with(DATASET_NAME_CONTEXT_KEY, datasetName);
        }
        auditLogger.preparationCreated(builder.build());
    }

    private Context buildFolderContext(String folderId, String folderName) {
        ContextBuilder contextBuilder = ContextBuilder
                .create() //
                .with(FOLDER_ID_CONTEXT_KEY, folderId) //
                .with(FOLDER_NAME_CONTEXT_KEY, folderName);
        return contextBuilder.build();
    }

    public void auditFolderCreation(String folderId, String folderName) {
        auditLogger.folderCreated(buildFolderContext(folderId, folderName));
    }

    public void auditFolderRename(String folderId, String folderName) {
        auditLogger.folderRename(buildFolderContext(folderId, folderName));
    }

    public void auditFolderShare(String folderId, Map<String, String> actionByUser) {
        auditLogger.folderShare(null);
    }
}