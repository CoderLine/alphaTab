import { FC } from "react";
export type ParameterValueSpec = [string, string];
export type ParameterValuesTableProps = {
    values: ParameterValueSpec[]
}
export const ParameterValuesTable: FC<ParameterValuesTableProps> = ({ values }) => {
    return (
        <div style={{ overflow: "auto", maxHeight: "300px" }}>
            <table className="table table-striped table-condensed type-table">
                <thead>
                    <tr>
                        <th>Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {values.map(v => (
                        <tr>
                            <td>
                                <code>{v[0]}</code>
                            </td>
                            <td>
                                {v[1]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}