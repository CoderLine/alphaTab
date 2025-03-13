export type JsDocText = {
  kind: "text";
  text: string;
};

export type JsDocLink = {
  kind: "link";
  name: string;
  text: string;
};

export type JsDocTag = {
  kind: "jsdoctag";
  tagName: string;
  comment: JsDocComment;
};

export type JsDocComment = (JsDocText | JsDocLink)[];

export type JsDoc = {
  kind: "jsdoc";
  comment: JsDocComment;
  tags?: JsDocTag[];
};

export type TsDoc = (JsDoc | JsDocTag)[];

export function getDescriptionText(tsdoc: TsDoc) {
  let text = "";

  for (const d of tsdoc) {
    if (d.kind === "jsdoc") {
      for (const x of d.comment) {
        if (x.kind === "text") {
          text += x.text;
        } else if (x.kind === "link") {
          text += x.name;
        }
      }
    }
  }

  return text;
}
