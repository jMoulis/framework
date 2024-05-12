
export default class MutationObserverService {
  globalObserver!: MutationObserver;

  flattenNodes(nodes: Node[]): Node[] {
    return nodes.reduce((acc, node) => {
      if (node instanceof Element) {
        acc.push(node);
        acc.push(...this.flattenNodes(Array.from(node.children)));
      }
      return acc;
    }, [] as Node[]);
  }
  disconnectGlobalObserver() {
    this.globalObserver?.disconnect();
  }
  startGlobalObserver() {
    // this.globalObserver = new MutationObserver((mutationsList) => {
    //   const deletedNodes = [];
    //   for (const mutation of mutationsList) {
    //     if (mutation.type === 'childList') {
    //       for (const removedNode of mutation.removedNodes) {
    //         deletedNodes.push(removedNode);
    //       }
    //     }
    //   }
    //   if (deletedNodes.length) {
    //     // subscriptionManager.unsubscribeNodes(this.flattenNodes(deletedNodes));
    //   }
    // });
    // this.globalObserver.observe(document.body, {
    //   childList: true,
    //   subtree: true
    // });
  }
}