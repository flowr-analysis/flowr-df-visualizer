import React, { PropsWithChildren } from "react";

interface MainContainerComponentProps {
  initialize: () => void;
}

export class MainContainerComponent extends React.Component<PropsWithChildren<MainContainerComponentProps>> {

  componentDidMount(): void {
    this.props.initialize();
  }

  render(): React.ReactNode {
    return <div className="main-container">
      {this.props.children}
    </div>;
  }
}