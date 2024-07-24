

interface LegendComponentProps {
    
}

export function slideInLegend() {
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export function slideOutLegend(){
    const element: HTMLDivElement = document.getElementById('slide-in-legend') as HTMLDivElement ?? new HTMLDivElement()
    element.classList.toggle('visible');
}

export const LegendComponent: React.FC<LegendComponentProps> = (props) => {

    return (
        <div className = 'slide-in-legend' id = 'slide-in-legend' >
            <div id = 'legend-close-button-div'>
                <button className = {'button-close-legend'} onClick = {slideOutLegend} >X</button>
            </div>
        </div>
    )
}