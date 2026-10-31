import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import { FC } from "react";
import Link from "@docusaurus/Link";
import { useDoc } from "@docusaurus/plugin-content-docs/lib/client/doc.js";

export type SignatureToken =
    [string, string] | [string, string, string];

export type SignatureProps = {
    style: 'block' | 'inline',
    js: SignatureToken[],
    csharp?: SignatureToken[],
    kotlin?: SignatureToken[],
}


type SignatureItemTokenProps = {
    token: SignatureToken,
};

export const SignatureItemToken: FC<SignatureItemTokenProps> = ({ token }) => {
    if (token.length === 2) {
        return (
            <span className={token[0]}>{token[1]}</span>
        )
    } else {
        return (
            <Link className={token[0]} to={token[2]}>{token[1]}</Link>
        )
    }
}

type SignatureItemProps = {
    style: 'block' | 'inline',
    tokens: SignatureToken[],
};


export const SignatureItem: FC<SignatureItemProps> = ({ style, tokens }) => {
    switch (style) {
        case "inline":
            return (
                <code className="codeBlockLinesInline">
                    {tokens.map((t, i) => <SignatureItemToken key={i} token={t} />)}
                </code>
            )
            break;
        case "block":
            return (
                <div className="codeBlockContainer">
                    <div className="codeBlockContent">
                        <pre className="codeBlock">
                            <code className="codeBlockLines generated">
                                {tokens.map((t, i) => <SignatureItemToken key={i} token={t} />)}
                            </code>
                        </pre>
                    </div>
                </div>
            )
    }
}

export const Signature: FC<SignatureProps> = ({ style, js, csharp, kotlin }) => {
    const items = [
        {
            label: 'JavaScript',
            value: 'js',
            tokens: js
        },
        {
            label: 'C#',
            value: 'cs',
            tokens: csharp
        },
        {
            label: 'Kotlin',
            value: 'kt',
            tokens: kotlin
        }
    ].filter(i => i.tokens !== undefined);

    if (items.length === 1) {
        return (<SignatureItem style={style} tokens={items[0]!.tokens as SignatureToken[]} />);
    }
    else {
        return <div className="signature-tabs">
            <Tabs defaultValue="js"
                values={items.map(i => ({ label: i.label, value: i.value }))}>
                {items.map(i => (
                    <TabItem key={i.value} value={i.value}>
                        <SignatureItem style={style} tokens={i.tokens!} />
                    </TabItem>
                ))}
            </Tabs>
        </div>
    }

};
