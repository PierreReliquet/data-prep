/*
 *  ============================================================================
 *
 *  Copyright (C) 2006-2018 Talend Inc. - www.talend.com
 *
 *  This source code is available under agreement available at
 *  https://github.com/Talend/data-prep/blob/master/LICENSE
 *
 *  You should have received a copy of the agreement
 *  along with this program; if not, write to Talend SA
 *  9 rue Pages 92150 Suresnes, France
 *
 *  ============================================================================
 */

package org.talend.dataprep.qa.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "backend")
public class BackendProperties {

    private User user = new User();

    private API api = new API();

    private Spark spark = new Spark();

    public static class User {

        private String login;

        private String password;

        public String getLogin() {
            return login;
        }

        public void setLogin(String login) {
            this.login = login;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class API {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    // TODO : nothing to do there, move this on EE part
    public static class Spark {

        private String hadoop;

        private String sjs;

        public String getHadoop() {
            return hadoop;
        }

        public void setHadoop(String hadoop) {
            this.hadoop = hadoop;
        }

        public String getSjs() {
            return sjs;
        }

        public void setSjs(String sjs) {
            this.sjs = sjs;
        }
    }

    public User getUser() {
        return user;
    }

    public API getApi() {
        return api;
    }

    public Spark getSpark() {
        return spark;
    }
}
