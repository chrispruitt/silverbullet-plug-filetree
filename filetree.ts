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
  
  return `
    ${d3js}
    ${d3filetree}
    
    const tree = ${tree};
    const chart = FileTree(tree);
  `;
  return
}

export async function navigate(page: string) {
  if (page.length === 0) {
    return;
  }
  console.log(`navigating to ${page}`);

  await editor.navigate(page);
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

async function buildTree(currentPage: string) {
  const pages = await space.listPages();
  const nodeNames = pages.map(({ name }) => {
    return name;
  });

  let result = [];
  let level = {result};

  await nodeNames.forEach(path => {
    path.split('/').reduce((r, name, i, a) => {
      if(!r[name]) {
        r[name] = {result: []};
        let item = {name, children: r[name].result}

        // If file, add path for link. Checking if last item
        if (i === a.length -1) {
          item['path'] = `${path}`
          item['type'] = 'file'
        } else {
          item['type'] = `directory`
        }
        r.result.push(item)
      }
      return r[name];
    }, level)
  })

  return {
    "name": "Files",
    "children": result
  }
}
