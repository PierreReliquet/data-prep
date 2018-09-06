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

import org.springframework.boot.autoconfigure.condition.*;
import org.springframework.stereotype.*;

@Component
@ConditionalOnProperty(name = "audit.log.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpAuditService implements BaseDataprepAuditService {

    @Override
    public void auditPreparationCreation(String prepName, String prepId, String datasetName, String datasetId,
            String folderId) {

    }

    @Override
    public void auditFolderCreation(String folderId, String folderName) {

    }

    @Override
    public void auditFolderRename(String folderId, String folderName) {

    }

    @Override
    public void auditFolderShare(String folderId, Map<String, String> actionByUser) {

    }
}