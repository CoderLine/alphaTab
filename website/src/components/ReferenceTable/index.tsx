import React from 'react';
import { Page } from '@site/src/page';
import { buildNames } from '@site/src/names';
import { CodeBadge } from '../CodeBadge';
import { PropSidebarItem, PropSidebarItemCategory } from '@docusaurus/plugin-content-docs';
import { useDocById } from '@docusaurus/theme-common/internal';

function buildPropertyUrl(property: Page) {
    let url = '';
    if (property.prop('todo', false)) {
        url = "#todo";
    } else {
        url = property.prop('link', '')
    }
    return url;
}

class ReferenceRow extends React.Component<{ property: Page, showJson: boolean }> {
    public render() {
        const { jsNames, csNames, jQueryNames, domNames, androidNames } = buildNames(this.props.property);
        const jsonNames = this.props.showJson ? jsNames : [];
        return (
            <tr>
                <td>
                    <a href={buildPropertyUrl(this.props.property)}>
                        {jsNames.map(n => <CodeBadge key={n} type="js" name={n} />)}

                        {jsonNames.length > 0 && <br />}
                        {jsonNames.map(n => <CodeBadge key={n} type="json" name={n} />)}

                        {(jsonNames.length > 0 || jsonNames.length > 0) && jQueryNames.length > 0 && <br />}
                        {jQueryNames.map(n => (<CodeBadge key={n} type="jquery" name={n} />))}

                        {domNames.length > 0 && <br />}
                        {domNames.map(n => (<CodeBadge key={n} type="html" name={n} />))}

                        {csNames.length > 0 && <br />}
                        {csNames.map(n => (<CodeBadge key={n} type="net" name={n} />))}

                        {androidNames.length > 0 && <br />}
                        {androidNames.map(n => (<CodeBadge key={n} type="android" name={n} />))}
                    </a>
                </td>
                <td>{this.props.property.prop('description', '')}</td>
            </tr>
        )
    }
}

class ReferenceCategory extends React.Component<{ name: string, pages: Page[], showJson: boolean }> {
    public render() {
        const rows = this.props.pages
            .sort((a, b) => {
                const ao = a.prop('order', 1000);
                const bo = b.prop('order', 1000);

                if (ao < bo) return -1;
                if (ao > bo) return 1;

                const at = a.prop('title', '');
                const bt = b.prop('title', '');

                if (at < bt) return -1;
                if (at > bt) return 1;

                return 0;
            })
            .map((p, i) => (<ReferenceRow key={p.prop('id', i)} property={p} showJson={this.props.showJson} />));
        return (
            <>
                <tr>
                    <th colSpan={4}>{this.props.name}</th>
                </tr>
                {rows}
            </>
        );
    }
}

function collectPages(target: PropSidebarItem[], items: PropSidebarItem[]) {
    for (const item of items) {
        if (item.type === 'category') {
            collectPages(target, item.items);
        } else if (item.type === 'link') {
            target.push(item);
        }
    }
}

export interface ReferenceTableProps {
    currentSidebarCategory: PropSidebarItemCategory;
    type: string;
    showJson: boolean;
}

export function ReferenceTable({currentSidebarCategory, type, showJson}: ReferenceTableProps): JSX.Element {
    const allPages: PropSidebarItem[] = [];
    collectPages(allPages, currentSidebarCategory.items);
    const existingKeys = new Map<string, Page[]>();
    const pages: { key: string, items: Page[] }[] = [];
    for (const page of allPages) {
        const category = page.customProps?.category as string ?? '';
        let items = existingKeys.get(category);
        if (!items) {
            items = [];
            existingKeys.set(category, items);
            pages.push({ key: category, items: items });
        }

        const doc = page.type === 'link' ? useDocById(page.docId) : undefined;
        items.push(new Page(page, doc));
    }
    pages.sort((a, b) => {
        return a.key.localeCompare(b.key);
    });
    const categories = pages
        .map(p => (<ReferenceCategory key={p.key} name={p.key} pages={p.items} showJson={showJson} />));
    return (
        <table className="table table-striped table-condensed reference-table" >
            <thead>
                <tr>
                    <th>{type}</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
                {categories}
            </tbody>
        </table>
    )
}