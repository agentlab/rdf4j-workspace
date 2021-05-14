import { getSnapshot } from 'mobx-state-tree';
import { Spin } from 'antd';
import { Graph } from './diagram/Graph';
import { useRootStore } from '../stores/RootContext';
import moment from 'moment';
import { viewKinds } from '../stores/viewKinds';

export const GraphEditor = ({ viewDescrCollId, viewDescrId, viewKindCollId, viewKindId }: any) => {
  const { rootStore } = useRootStore();

  const collWithViewDescrsObs = rootStore.getColl(viewDescrCollId);
  if (!collWithViewDescrsObs) {
    console.log('!collWithViewDescrsObs', viewDescrCollId);
    return <Spin />;
  }

  const viewDescrObs = collWithViewDescrsObs?.dataByIri(viewDescrId);
  if (!viewDescrObs) {
    console.log('!viewDescrObs', viewDescrId);
    return <Spin />;
  }

  const collWithViewKindsObs = rootStore.getColl(viewKindCollId);
  if (!collWithViewKindsObs) {
    console.log('!collWithViewKindsObs', viewKindCollId);
    return <Spin />;
  }
  const viewKindObs = collWithViewKindsObs?.dataIntrnl[0];
  if (!viewKindObs) {
    console.log('!viewKindObs', viewKindId);
    return <Spin />;
  }
  const viewKind: any = getSnapshot(viewKindObs);
  const view: any = getSnapshot(viewDescrObs);

  const viewKindStencils = viewKind?.elements.reduce((acc, e) => {
    acc[e['@id']] = e;
    return acc;
  }, {});

  const dataSource = viewKind?.elements.reduce((acc, e) => {
    const dataUri = view.collsConstrs.filter((el) => el['@parent'] === e.resultsScope);
    const graphData = rootStore.getColl(dataUri[0]);
    acc[e['@id']] = graphData?.data ? getSnapshot(graphData?.data) : [];
    return acc;
  }, {});

  return (
    <Graph
      view={view}
      viewDescrObs={viewDescrObs}
      viewKindStencils={viewKindStencils}
      viewKind={viewKind}
      dataSource={dataSource}
    />
  );
};
