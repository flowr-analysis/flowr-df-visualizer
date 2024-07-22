

interface LegendComponentProps {
    
}

export function slideInLegend() {
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.className = 'slide-in-legend-visible'
}

export function slideOutLegend(){
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.className = 'slide-in-legend-invisible'
}

export const LegendComponent: React.FC<LegendComponentProps> = (props) => {

    return (
        <div className = 'slide-in-legend-invisible' id = 'slide-in-legend' >
            <div id = 'legend-close-button-div'>
                <button className = {'button-close-legend'} onClick = {slideOutLegend} >X</button>
            </div>
        </div>
    )
}