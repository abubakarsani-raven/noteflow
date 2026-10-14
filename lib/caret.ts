// Helper to calculate exact pixel coordinates (top, left) of caret in a textarea
// Standard mirror div technique used by Slack, Notion, GitHub

const properties = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number; height: number } {
  if (typeof window === "undefined") {
    return { top: 0, left: 0, height: 20 };
  }

  const div = document.createElement("div");
  div.id = "input-textarea-caret-position-mirror-div";
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  style.top = "0";
  style.left = "-9999px";

  properties.forEach((prop) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (style as any)[prop] = computed[prop as any];
  });

  style.overflow = "hidden";

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || "0", 10) - element.scrollTop,
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || "0", 10) - element.scrollLeft,
    height: parseInt(computed.lineHeight || "20", 10) || 20,
  };

  document.body.removeChild(div);

  return coordinates;
}
