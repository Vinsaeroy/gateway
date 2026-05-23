import * as React from "react";

/**
 * Wrapper to mark content as non-translatable.
 *
 * Browser translators (Google Translate, Microsoft Edge translate, etc.)
 * mutate the DOM by replacing text nodes with `<font>` wrappers. When React
 * later tries to update those nodes it can throw:
 *   "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 * or
 *   "The node to be removed is not a child of this node"
 *
 * Wrapping dynamic / interactive content in `<NoTranslate>` (or adding
 * `translate="no"` directly) prevents the translator from touching it,
 * so React owns the DOM updates safely.
 */
export const NoTranslate = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(function NoTranslate({ children, className, ...props }, ref) {
    return (
        <span
            ref={ref}
            translate="no"
            className={`notranslate ${className ?? ""}`.trim()}
            {...props}
        >
            {children}
        </span>
    );
});
