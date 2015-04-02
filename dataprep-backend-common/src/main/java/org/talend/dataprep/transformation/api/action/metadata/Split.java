package org.talend.dataprep.transformation.api.action.metadata;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import org.apache.commons.lang.StringUtils;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.metadata.Item.Value;

/**
 * Split a cell value on a separator.
 * 
 * THIS ACTION IS NOT MAPPED YET IN ActionParser AND SUGGESTED. It was designed to test conditional parameters in ui.
 * Remove this comments when action is registered.
 */
// @Component(Split.ACTION_BEAN_PREFIX + Split.SPLIT_ACTION_NAME)
public class Split extends SingleColumnAction {

    public static final String SPLIT_ACTION_NAME = "split"; //$NON-NLS-1$

    // The separator shown to the user as a list. An item in this list is the value 'other', which allow the user to
    // manually enter its separator.
    private static final String SEPARATOR_PARAMETER = "separator"; //$NON-NLS-1$

    // The separator manually specified by the user. Should be used only if SEPARATOR_PARAMETER value is 'other'
    private static final String MANUAL_SEPARATOR_PARAMETER = "manual_separator"; //$NON-NLS-1$

    private Split() {
    }

    @Override
    public String getName() {
        return SPLIT_ACTION_NAME;
    }

    @Override
    public String getCategory() {
        return "repair"; //$NON-NLS-1$
    }

    @Override
    public Item[] getItems() {
        Value[] values = new Value[] { new Value(":", true), new Value("@"),
                new Value("other", new Parameter(MANUAL_SEPARATOR_PARAMETER, Type.STRING.getName(), StringUtils.EMPTY)) };
        return new Item[] { new Item(SEPARATOR_PARAMETER, "categ", values) };
    }

    @Override
    public Consumer<DataSetRow> create(Map<String, String> parameters) {
        String realSeparator = (parameters.get(SEPARATOR_PARAMETER).equals("other") ? parameters.get(MANUAL_SEPARATOR_PARAMETER)
                : parameters.get(SEPARATOR_PARAMETER));

        return row -> {
            String columnName = parameters.get(COLUMN_NAME_PARAMETER_NAME);
            String value = row.get(columnName);
            if (value != null) {
                String[] split = value.split(realSeparator);
                for (int i = 0; i < split.length; i++) {
                    row.set(columnName + "_split_" + i, split[i]);
                }
            }
        };
    }

    @Override
    public Set<Type> getCompatibleColumnTypes() {
        return Collections.singleton(Type.STRING);
    }
}
