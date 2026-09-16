# RC65 FUNCTION MAP ADDENDUM

Classic RC Schedule control flow:

`click/touch -> delegated capture listener -> classicRCDispatchAction(button) -> existing ClassicRCEngine / ClassicRCRuntime public action`

The drawer no longer depends on attaching a fresh `onclick` function to every action button after each render. Sport calculations and scheduler methods are unchanged.
