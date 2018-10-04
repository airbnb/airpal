package com.airbnb.airpal.core.execution;

import com.airbnb.airpal.presto.Table;
import com.facebook.presto.sql.tree.*;
import com.google.common.collect.Sets;
import lombok.EqualsAndHashCode;
import lombok.Value;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Value
@EqualsAndHashCode(callSuper = false)
public class InputReferenceExtractor
        extends DefaultTraversalVisitor<InputReferenceExtractor.CatalogSchemaContext, InputReferenceExtractor.CatalogSchemaContext>
{
    private final Set<Table> references = new HashSet<>();
    private final Set<Table> aliases = new HashSet<>();

    public Set<Table> getReferences()
    {
        return Sets.difference(references, aliases);
    }

    private Table qualifiedNameToTable(QualifiedName name, CatalogSchemaContext context)
    {
        List<String> nameParts = name.getParts();

        String connectorId = context.getCatalog();
        String schema = context.getSchema();
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
    protected CatalogSchemaContext visitCreateView(CreateView node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getName(), context));
        visitQuery(node.getQuery(), context);

        return context;
    }

    @Override
    protected CatalogSchemaContext visitCreateTable(CreateTable node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getName(), context));
        visitCreateTable(node, context);

        return context;
    }

    @Override
    protected CatalogSchemaContext visitDropTable(DropTable node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getTableName(), context));
        return context;
    }

    @Override
    protected CatalogSchemaContext visitDropView(DropView node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getName(), context));
        return context;
    }

    @Override
    protected CatalogSchemaContext visitTable(com.facebook.presto.sql.tree.Table node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getName(), context));
        return context;
    }

    @Override
    protected CatalogSchemaContext visitRenameTable(RenameTable node, CatalogSchemaContext context)
    {
        references.add(qualifiedNameToTable(node.getSource(), context));
        return context;
    }

    @Override
    protected CatalogSchemaContext visitWithQuery(WithQuery node, CatalogSchemaContext context)
    {
        aliases.add(new Table(context.getCatalog(), context.getSchema(), node.getName().getValue()));
        return super.visitWithQuery(node, context);
    }

    @Override
    protected CatalogSchemaContext visitUse(Use node, CatalogSchemaContext context)
    {
        return new CatalogSchemaContext(node.getCatalog().orElse(new Identifier(context.getCatalog())).getValue(), node.getSchema().getValue());
    }

    @Override
    protected CatalogSchemaContext visitNode(Node node, CatalogSchemaContext context)
    {
        return context;
    }

    @Override
    protected CatalogSchemaContext visitJoin(Join node, CatalogSchemaContext context)
    {
        process(node.getLeft(), context);
        process(node.getRight(), context);

        if (node.getCriteria().isPresent()) {
            if (node.getCriteria().get() instanceof JoinOn) {
                process(((JoinOn) node.getCriteria().get()).getExpression(), context);
            }
        }

        return context;
    }

    @Value
    public static class CatalogSchemaContext
    {
        private final String catalog;
        private final String schema;
    }
}
