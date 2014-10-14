package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.presto.Table;
import com.facebook.presto.sql.tree.CreateTable;
import com.facebook.presto.sql.tree.CreateView;
import com.facebook.presto.sql.tree.DefaultTraversalVisitor;
import com.facebook.presto.sql.tree.DropTable;
import com.facebook.presto.sql.tree.DropView;
import com.facebook.presto.sql.tree.QualifiedName;
import com.facebook.presto.sql.tree.RenameTable;
import com.facebook.presto.sql.tree.WithQuery;
import com.google.common.collect.Sets;
import lombok.EqualsAndHashCode;
import lombok.Value;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Value
@EqualsAndHashCode(callSuper = false)
public class InputReferenceExtractor
        extends DefaultTraversalVisitor<Void, Void>
{
    private final Set<Table> references = new HashSet<>();
    private final Set<Table> aliases = new HashSet<>();
    private final String defaultConnector;
    private final String defaultSchema;

    public Set<Table> getReferences()
    {
        return Sets.difference(references, aliases);
    }

    private Table qualifiedNameToTable(QualifiedName name)
    {
        List<String> nameParts = name.getParts();

        String connectorId = defaultConnector;
        String schema = defaultSchema;
        String table = null;

        if (nameParts.size() == 3) {
            connectorId = nameParts.get(0);
            schema = nameParts.get(1);
            table = nameParts.get(2);
        } else if (nameParts.size() == 2) {
            schema = nameParts.get(0);
            table = nameParts.get(1);
        } else if (nameParts.size() == 1) {
            table = nameParts.get(0);
        }

        return new Table(connectorId, schema, table);
    }

    @Override
    protected Void visitCreateView(CreateView node, Void context)
    {
        references.add(qualifiedNameToTable(node.getName()));
        visitQuery(node.getQuery(), context);

        return super.visitCreateView(node, context);
    }

    @Override
    protected Void visitCreateTable(CreateTable node, Void context)
    {
        references.add(qualifiedNameToTable(node.getName()));
        visitQuery(node.getQuery(), context);

        return super.visitCreateTable(node, context);
    }

    @Override
    protected Void visitDropTable(DropTable node, Void context)
    {
        references.add(qualifiedNameToTable(node.getTableName()));
        return super.visitDropTable(node, context);
    }

    @Override
    protected Void visitDropView(DropView node, Void context)
    {
        references.add(qualifiedNameToTable(node.getName()));
        return super.visitDropView(node, context);
    }

    @Override
    protected Void visitTable(com.facebook.presto.sql.tree.Table node, Void context)
    {
        references.add(qualifiedNameToTable(node.getName()));
        return super.visitTable(node, context);
    }

    @Override
    protected Void visitRenameTable(RenameTable node, Void context)
    {
        references.add(qualifiedNameToTable(node.getSource()));
        return super.visitRenameTable(node, context);
    }

    @Override
    protected Void visitWithQuery(WithQuery node, Void context)
    {
        aliases.add(new Table(defaultConnector, defaultSchema, node.getName()));
        return super.visitWithQuery(node, context);
    }
}
