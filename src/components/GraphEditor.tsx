import React, { useContext } from 'react';
import { getSnapshot } from 'mobx-state-tree';
import { observer } from 'mobx-react-lite';
import { Spin } from 'antd';
import { MstContext } from '@agentlab/ldkg-ui-react';

import { Graph } from './diagram/Graph';

export const GraphEditor = observer<any>(({ viewDescrCollId, viewDescrId, viewKindCollId, onSelect }: any) => {
  const { store } = useContext(MstContext);
  if (!store) {
    console.log('!store', store);
    return <Spin />;
  }

  const collWithViewDescrsObs = store.getColl(viewDescrCollId);
  if (!collWithViewDescrsObs) {
    console.log('!collWithViewDescrsObs', viewDescrCollId);
    return <Spin />;
  }

  const viewDescrObs = collWithViewDescrsObs?.dataByIri(viewDescrId);
  if (!viewDescrObs) {
    console.log('!viewDescrObs', viewDescrId);
    return <Spin />;
  }

  const collWithViewKindsObs = store.getColl(viewKindCollId);
  if (!collWithViewKindsObs) {
    console.log('!collWithViewKindsObs', viewKindCollId);
    return <Spin />;
  }
  const viewKindId = viewDescrObs.viewKind;
  const viewKindObs = collWithViewKindsObs.dataByIri(viewKindId);
  if (!viewKindObs) {
    console.log('!viewKindObs', viewKindId);
    return <Spin />;
  }
  const viewKind: any = getSnapshot(viewKindObs);
  const view: any = getSnapshot(viewDescrObs);

  const regStencils = (stencils, arr) => {
    arr.forEach((e) => {
      if (e.elements) {
        regStencils(stencils, e.elements);
      }
      if (e.type === 'DiagramNode') {
        stencils[e['@id']] = e;
      }
    });
  };
  const stencilPanel: any = {};
  const viewKindStencils = viewKind?.elements.reduce((acc, e) => {
    if (e.elements) {
      regStencils(acc, e.elements);
    }
    acc[e['@id']] = e;
    stencilPanel[e['@id']] = e;
    return acc;
  }, {});

  const dataSource = viewKind?.elements.reduce((acc, e) => {
    const dataUri = view.collsConstrs.filter((el) => el['@parent'] === e.resultsScope);
    const graphData = store.getColl(dataUri[0]);
    acc[e['@id']] = graphData?.data ? getSnapshot(graphData?.data) : [];
    return acc;
  }, {});

  return (
    <Graph
      view={view}
      viewDescrObs={viewDescrObs}
      viewKindStencils={viewKindStencils}
      stencilPanel={stencilPanel}
      viewKind={viewKind}
      dataSource={dataSource}
      onSelect={onSelect}
    />
  );
});
