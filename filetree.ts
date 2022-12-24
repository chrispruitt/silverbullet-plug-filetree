import {
  clientStore,
  editor,
  index,
  space,
} from "$sb/silverbullet-syscall/mod.ts";
import { asset } from "$sb/plugos-syscall/mod.ts";

const TreeViewKey = "showTreeView";

export async function toggleTreeView() {
  const showingTreeView = (await getTreeViewStatus());
  await clientStore.set(TreeViewKey, !showingTreeView);
  if (!showingTreeView) {
    const name = await editor.getCurrentPage();
    await renderTree(name);
  } else {
    await editor.hidePanel("lhs");
  }
}

// if something changes, redraw
export async function updateTreeView() {
  const name = await editor.getCurrentPage();
  await renderTree(name);
}

// Use store to figure out if backlinks are open or closed.
async function getTreeViewStatus(): Promise<boolean> {
  return !!(await clientStore.get(TreeViewKey));
}

async function script(tree: any) {
  const d3js = await asset.readAsset("assets/d3.js", "utf8");
  const d3filetree = await asset.readAsset("assets/d3-filetree.js", "utf8");
  // const d3forcetree = await asset.readAsset(
  //   "asset/force-tree.js",
  //   "utf8",
  // );
  // TODO: Get current height and width
  
  return `
    ${d3js}
    ${d3filetree}
    
    const tree = ${tree};
    console.log(tree);
    const chart = FileTree(tree);
    
  `;
  // TODO: may not need this below but saving here
  // const tree_div = document.querySelector('#tree');
  //   tree_div.appendChild(chart);
  return
}

// render function into the LHS
async function renderTree(page: any) {
  // https://github.com/d3/d3-force
  const tree = await buildTree(page);
  const tree_json = JSON.stringify(tree);
  if (await getTreeViewStatus()) {
    await editor.showPanel(
      "lhs",
      1,
      `<html>
        <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css" media="all" rel="stylesheet">
        <style>

        .node text {
          cursor: pointer;
        }

        .selected {
          fill: #ff751a;
          font-weight: bold;
        }

        .start {
          overflow:scroll;
          height:1000px
        }

      </style>
        </head>
        <body>
          <div class="start">
          </div>
        </body>
      </html>`,
      await script(tree_json), // Script (java script as string)
    );
  }
}

async function buildTree(name: string) {
  const pages = await space.listPages();
  const nodeNames = pages.map(({ name }) => {
    return name;
  });

  console.log(nodeNames)

  // NOTE: This may result to the same link showing multiple times
  //       if the same page has multiple references to another page.
  const pageLinks = await index.queryPrefix(`pl:`);
  const links = pageLinks.map(({ key, page }) => {
    const [, to] = key.split(":"); // Key: pl:page:pos

    if (!nodeNames.includes(to)) {
      // Add nodes for non-existing pages which are linked to
      nodeNames.push(to);
    }
    return { "source": page, "target": to };
  });

  const nodes = nodeNames.map((name) => {
    return { "id": name };
  });

  let result = [];
  let level = {result};

  await nodeNames.forEach(path => {
    path.split('/').reduce((r, name, i, a) => {
      if(!r[name]) {
        r[name] = {result: []};
        r.result.push({name, children: r[name].result})
      }
      
      return r[name];
    }, level)
  })

  return {
    "name": "Files",
    "children": result
  }
}
