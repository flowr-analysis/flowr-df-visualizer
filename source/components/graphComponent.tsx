import React from "react";
import EChartsReact from 'echarts-for-react';
import { EChartsOption, GraphSeriesOption } from "echarts";


// TODO: loading https://echarts.apache.org/handbook/en/basics/release-note/5-3-0/?ref=banner

interface GraphViewComponentProps {
}

interface GraphViewComponentState {
   option: EChartsOption | undefined;
}

export class GraphViewComponent extends React.Component<GraphViewComponentProps, GraphViewComponentState> {
   private series: GraphSeriesOption | null | undefined;
   private filter = '';
   private ref: React.RefObject<EChartsReact> = React.createRef();

   constructor(props: GraphViewComponentProps) {
      super(props);
      this.state = {
         option: undefined
      };
   }

   shouldComponentUpdate(nextProps: Readonly<GraphViewComponentProps>, nextState: Readonly<GraphViewComponentState>, nextContext: any): boolean {
      return this.state.option !== nextState.option;
   }

   updateFilter(filter: string): void { // nosonar - rule only checks local scope, we don't need here
      this.filter = filter ?? '';
      this.updateState();
   }

   /**
    * Update the data backing up the chart
    */
   updateTreeSeries(series: GraphSeriesOption | undefined) { // nosonar - rule only checks local scope, we don't need here
      this.series = series;
      this.updateState();
   }

   private updateState() {
      this.setState({
         option: this.series as EChartsOption
      });
   }

   render(): React.ReactNode {
      // TODO: loader
      return <div className="tree-view-container">
         {this.state.option ? <EChartsReact option={this.state.option} opts={{
            renderer: 'canvas'
         }} style={{ width: '100%', height: '100%' }} ref={this.ref} ></EChartsReact> : <div />}
      </div>;
   }
}

