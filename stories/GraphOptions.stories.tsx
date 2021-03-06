import { cloneDeep } from 'lodash-es';
import React from 'react';
import { Story, Meta } from '@storybook/react';

import { getSnapshot, applySnapshot } from 'mobx-state-tree';
import { Provider } from 'react-redux';
import { asReduxStore, connectReduxDevtools } from 'mst-middlewares';

import { SparqlClientImpl, Repository } from '@agentlab/sparql-jsld-client';
import { MstContextProvider } from '@agentlab/ldkg-ui-react';

import { GraphEditor } from '../src/components/GraphEditor';

import { viewKindCollConstr, viewDescrCollConstr } from '../src/stores/view';
import { mktpModelInitialState, mktpViewDescrs, mktpViewKinds } from '../src/stores/ViewCard';

import { Spin } from 'antd';

import '../src/index.css';
import '../src/App.css';

const client = new SparqlClientImpl('https://rdf4j.agentlab.ru/rdf4j-server');
//@ts-ignore
const rootStore = Repository.create(mktpModelInitialState, { client });
const store: any = asReduxStore(rootStore);
// eslint-disable-next-line @typescript-eslint/no-var-requires
connectReduxDevtools(require('remotedev'), rootStore);

const StoryEditor = ({ args }) => {
  const collWithViewDescrsObs = rootStore.getColl(viewDescrCollConstr['@id']);
  if (!collWithViewDescrsObs) {
    console.log('!collWithViewDescrsObs', viewDescrCollConstr['@id']);
    return <Spin />;
  }

  const viewDescrObs = collWithViewDescrsObs?.dataByIri(mktpViewDescrs[0]['@id']);
  if (!viewDescrObs) {
    console.log('!viewDescrObs', mktpViewDescrs[0]['@id']);
    return <Spin />;
  }
  const view = cloneDeep(getSnapshot(viewDescrObs));
  (view as any).options = { ...(view as any).options, ...args };
  applySnapshot(viewDescrObs, view);
  return (
    <GraphEditor
      viewDescrCollId={viewDescrCollConstr['@id']}
      viewDescrId={mktpViewDescrs[0]['@id']}
      viewKindCollId={viewKindCollConstr['@id']}
      viewKindId={mktpViewKinds[0]['@id']}
    />
  );
};
const Template: Story<any> = (args: any) => {
  return (
    <Provider store={store}>
      <MstContextProvider store={rootStore}>
        <StoryEditor args={args} />
      </MstContextProvider>
    </Provider>
  );
};

export default {
  title: 'GraphEditor/CardsDiagramOptions',
  component: Template,
} as Meta;

export const GraphOptions = Template.bind({});
GraphOptions.args = {
  title: true,
  minimap: true,
  configPanel: true,
  toolbar: true,
};
