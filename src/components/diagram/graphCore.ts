import { Graph, Cell } from "@antv/x6";
import { ReactShape } from "@antv/x6-react-shape";
import { stencils } from './stencils/index';
import { EdgeView, NodeView } from "@antv/x6";

class SimpleNodeView extends NodeView {
  protected renderMarkup() {
    this.renderJSONMarkup({
      tagName: 'rect',
      selector: 'body',
    })
  }
  update() {
    super.update({
      body: {
        refWidth: '100%',
        refHeight: '100%',
        fill: '#31d0c6',
      },
    })
  }
};

class SimpleEdgeView extends EdgeView {
	update() {
		this.cleanCache()
    this.updateConnection()
		const partialAttrs = {
			line: {
				stroke: "#31d0c6", 
				strokeWidth: 4, 
				targetMarker: "classic"
			},
			lines: {
				connection: true, 
				strokeLinejoin: "round"
			},
			wrap: {
				strokeWidth: 4
			}
		}
    const attrs = this.cell.getAttrs()
    if (attrs != null) {
      super.updateAttrs(this.container, attrs, {
        attrs: partialAttrs === attrs ? null : partialAttrs,
        selectors: this.selectors,
      })
    }
		return this;
	}
	renderTools() {
		return this;
	}
	renderExternalTools() {
		return this;
	}
	renderArrowheadMarkers() {
		return this;
	}
	renderVertexMarkers() {
		return this;
	}
	renderLabels() {
		return this;
	}
};

export const createGraph = ({ width, height, refContainer, minimapContainer}) => {
	try {
		Graph.registerNode("group", {
			inherit: ReactShape,
		});
		Graph.registerNode("compartment", {
			inherit: ReactShape,
		});
		Graph.registerNode("field", {
			inherit: ReactShape,
		});
	}
	catch (e) { // typically happens during recompilation
		console.log(e);
	}
	const g = new Graph({
		container: refContainer.current,
		width: width,
		height: height,
		grid: {
			visible: true,
		},
		resizing: {
			enabled: true,
		},
		history: true,
		clipboard: {
			enabled: true,
		},
		minimap:{
			enabled: true,
			container: minimapContainer.current,
			width: 200,
			height: 160,
			padding: 10,
			graphOptions: {
				async: false,
				sorting: 'none',
				getCellView(cell) {
					if (cell.isNode()) {
						return SimpleNodeView
					}
					if (cell.isEdge()) {
						return SimpleEdgeView;
					}
				},
			}
		},
		scroller: {
			enabled: true,
			pageVisible: true,
			pageBreak: false,
			pannable: true,
		},
		//minimap,
		embedding: {
			enabled: true,
			findParent: "center",
		},
		selecting: true,
		connecting: {
			dangling: false,
			router: "manhattan",
			connector: {
				name: "jumpover",
				args: {
					type: "gap",
				},
			},
		},
		keyboard: {
			enabled: true,
		},
	});

	// g.on("node:added", (e) => {
	// 	handleGraphEvent(e, "add");
	// });
	return g;
};

export const createGrid = ({graph, view}) => {
	const drawNewGrid = (attrs) => {
		let options
		if (attrs.type === 'doubleMesh') {
			options = {
				type: attrs.type,
				args: [
					{
						color: attrs.color,
						thickness: attrs.thickness,
					},
					{
						color: attrs.colorSecond,
						thickness: attrs.thicknessSecond,
						factor: attrs.factor,
					},
				],
			}
		} else {
			options = {
				type: attrs.type,
				args: [
					{
						color: attrs.color,
						thickness: attrs.thickness,
					},
				],
			}
		}
		graph.drawGrid(options)
	}

	if (view.options?.gridOptions) {
		drawNewGrid(view.options.gridOptions);
		if (view.options.gridOptions.size) graph.setGridSize(view.options.gridOptions.size);
		if (view.options.gridOptions.bgColor) graph.drawBackground({ color: view.options.gridOptions.bgColor });
	}
};

export const addNewParentNodes = ({graph, nodesData}) =>{
	const renderer = stencils['rm:ClassNodeStencil'];
	nodesData.forEach((data: any) => {
		const node = nodeFromData({data, shape: 'group', renderer: renderer({data})});
		(graph as Graph).addNode(node);
	});
};

export const addNewChildNodes = ({graph, nodesData}) =>{
	const renderer = stencils['rm:PropertyNodeStencil'];
	nodesData.forEach((data: any) => {
		const node = nodeFromData({data, shape: 'field', renderer: renderer({data})});
		const child = (graph as Graph).addNode(node);
		const parent: Cell = (graph as Graph).getCell(data.parent);
		parent.addChild(child);
	});
};

export const addNewEdges = ({graph, edgesData}) => {
	edgesData.forEach((data: any) => {
		const edge = {
			id: data['@id'],
			target: data.arrowTo,
			source: data.arrowFrom,
			label: {
	
				markup: [
					{
						tagName: 'rect',
						selector: 'body',
					},
					{
						tagName: 'text',
						selector: 'label',
					},
				],
				attrs: {
					text: {
						text: data.subject.name,
						fill: '#000',
						fontSize: 10,
						textAnchor: 'middle',
						textVerticalAnchor: 'middle',
						pointerEvents: 'none',
					},
					rect: {
						ref: 'label',
						fill: '#fff',
						rx: 3,
						ry: 3,
						refWidth: 1,
						refHeight: 1,
						refX: 0,
						refY: 0,
					},
				},
				position: {
					distance: 0.5,
				},
			},
			router: {
				name: data.router || 'normal',
			}
		};
		(graph as Graph).addEdge(edge);
	});
};

const nodeFromData = ({data, shape, renderer}) => ({
	id: data['@id'],
	size: { width: data.width, height: data.height },
	position: { x: data.x, y: data.y},
	shape: shape,
	component(_) {
		return renderer;
	},
});