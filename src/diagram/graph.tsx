
import React from "react";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from 'uuid';

import { NodeShape } from "./visual_components/NodeShape";
import { Compartment } from "./visual_components/Compartment";
import { NodeField } from "./visual_components/NodeField";
import { NodeBox } from "./NodeBox"
import { Canvas } from "./Canvas"

const graphWidth = 800;
const graphHeight = 600;

const randPos = () => {
	return {
		x: Math.random() * (graphWidth - 100),
		y: Math.random() * (graphHeight - 100),
	};
};

const VericalBox = observer((props: any) => {
	const { data, parent_id } = props;

	const node = {
		id: data["@id"],
		size: { width: 140, height: 40 },
		zIndex: 0,
		position: randPos(),
		shape: "group",
		component(_) {
			return (<NodeShape text={data["@id"]} />);
		},
	}

	const generalFields = Object.entries(data)
		.filter(([key, val]) => (key !== 'property' && key !== '@id'));

	let propertyFields = [] as any;
	if (data['property']) {
		if (Array.isArray(data['property'])) {
			propertyFields = data['property'].map((prop) => ['sh:property', prop['@id']]);
		}
		else {
			propertyFields = [ [ 'sh:property', data['property']['@id'] ] ];
		}
	}

	return (
		<NodeBox node={node} edges={propertyFields} parent_id={parent_id}>
			{(generalFields.length > 0)
				? <WrapBox header="General" data={generalFields} />
				: <></>}
			{(propertyFields.length > 0)
				? <WrapBox header="Properties" data={propertyFields} />
				: <></>}
		</NodeBox>
	);
});

const WrapBox = observer((props: any) => {
	const { parent_id, header, data } = props;
	const node = {
		id: uuidv4(),
		size: { width: 200, height: 30 },
		zIndex: 1,
		shape: "compartment",
		component(_) {
			return <Compartment text={header} />;
		},
	}

	return (
		<NodeBox node={node} parent_id={parent_id}>
			{data.map(([name, val], idx) => <FieldBox key={idx} text={`${name}:	${val}`} />)}
		</NodeBox>
	);
});

const FieldBox = observer((props: any) => {
	const { parent_id, text } = props;

	const node = {
		id: uuidv4(),
		size: { width: 200, height: 50 },
		zIndex: 2,
		shape: "field",
		component(_) {
			return <NodeField text={text} />
		},
	}

	return (
		<NodeBox node={node} parent_id={parent_id} />
	);
});

export const Graph = (props: any) => {

	return (
		<Canvas width={graphWidth} height={graphHeight}>
			{props.data.shapes.map(shape => <VericalBox key={shape['@id']} data={shape} />)}
			{props.data.properties.map(shape => <VericalBox key={shape['@id']} data={shape} />)}
		</Canvas>
	);
}