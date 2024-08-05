
interface SvgDefinitionsComponentProps{}


export const SvgDefinitionsComponent: React.FC<SvgDefinitionsComponentProps> = ({}) => {
    return (
        <>
        <marker
            id="triangle"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
          </marker>
          
          <marker
            id="dotMarker"
            viewBox="-5 -5 10 10"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto">
              <circle className = 'dotMarker' r = '3'/>
          </marker>

          <marker
            id="crossMarker"
            viewBox="-5 -5 10 10"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto">
              <line x1='0' y1='3' x2='0' y2='-3' style={{stroke:'black', strokeWidth: '1'}}></line>
              <line x1='3' y1='0' x2='-3' y2='0' style={{stroke:'black', strokeWidth: '1'}}></line>
          </marker>

          <marker
            id="hexagonHollowMarker"
            viewBox="-10 -10 100 100"
            markerUnits="strokeWidth"
            markerWidth="50"
            markerHeight="50"
            orient="auto">
            <g transform='translate(-12,-12)'>
              <path d="m16.476 3c.369 0 .709.197.887.514.9 1.595 3.633 6.445 4.509 8.001.075.131.118.276.126.423.012.187-.029.377-.126.547-.876 1.556-3.609 6.406-4.509 8-.178.318-.518.515-.887.515h-8.951c-.369 0-.709-.197-.887-.515-.899-1.594-3.634-6.444-4.51-8-.085-.151-.128-.318-.128-.485s.043-.334.128-.485c.876-1.556 3.611-6.406 4.51-8.001.178-.317.518-.514.887-.514zm-8.672 1.5-4.228 7.5 4.228 7.5h8.393l4.227-7.5-4.227-7.5z"/>
            </g> 
          </marker>

          <marker
            id="rectangleHollowMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -75)'>
                <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="m3 17v3c0 .621.52 1 1 1h3v-1.5h-2.5v-2.5zm8.5 4h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5zm5-4h-1.5v2.5h-2.5v1.5h3c.478 0 1-.379 1-1zm-1.5-1v-3.363h1.5v3.363zm-15-3.363v3.363h-1.5v-3.363zm15-1v-3.637h1.5v3.637zm-15-3.637v3.637h-1.5v-3.637zm12.5-5v1.5h2.5v2.5h1.5v-3c0-.478-.379-1-1-1zm-10 0h-3c-.62 0-1 .519-1 1v3h1.5v-2.5h2.5zm4.5 1.5h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5z" fillRule="nonzero"/>
                </svg>
              </g>
          </marker>

          <marker
            id="triangleHollowMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -85)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m2.095 19.882 9.248-16.5c.133-.237.384-.384.657-.384.272 0 .524.147.656.384l9.248 16.5c.064.115.096.241.096.367 0 .385-.309.749-.752.749h-18.496c-.44 0-.752-.36-.752-.749 0-.126.031-.252.095-.367zm1.935-.384h15.939l-7.97-14.22z" fillRule="nonzero"/></svg>
              </g>
          </marker>

          <marker
            id="rhombusHollowMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -75)'>
                <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.262 2.306c.196-.196.461-.306.738-.306s.542.11.738.306c1.917 1.917 7.039 7.039 8.956 8.956.196.196.306.461.306.738s-.11.542-.306.738c-1.917 1.917-7.039 7.039-8.956 8.956-.196.196-.461.306-.738.306s-.542-.11-.738-.306c-1.917-1.917-7.039-7.039-8.956-8.956-.196-.196-.306-.461-.306-.738s.11-.542.306-.738c1.917-1.917 7.039-7.039 8.956-8.956zm-7.573 9.694 8.311 8.311 8.311-8.311-8.311-8.311z" fillRule="nonzero"/></svg>
              </g>
          </marker>


          <marker
            id="starFilledMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -75)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fillRule="nonzero"/></svg>
              </g>
          </marker>

          <marker
            id="circleHollowMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -75)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 2c5.517 0 9.997 4.48 9.997 9.998 0 5.517-4.48 9.997-9.997 9.997-5.518 0-9.998-4.48-9.998-9.997 0-5.518 4.48-9.998 9.998-9.998zm0 1.5c-4.69 0-8.498 3.808-8.498 8.498s3.808 8.497 8.498 8.497 8.497-3.807 8.497-8.497-3.807-8.498-8.497-8.498z" fillRule="nonzero"/></svg>
            </g>
          </marker>

          <marker
            id="cubeFilledMarker"
            viewBox="-500 -500 1000 1000"
            markerUnits="strokeWidth"
            markerWidth="70"
            markerHeight="70"
            orient="auto">
              <g transform='translate(-150, -75)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3.514 6.61c-.317.179-.514.519-.514.887v8.95c0 .37.197.708.514.887 1.597.901 6.456 3.639 8.005 4.512.152.085.319.128.487.128.164 0 .328-.041.477-.123 1.549-.855 6.39-3.523 7.994-4.408.323-.177.523-.519.523-.891v-9.055c0-.368-.197-.708-.515-.887-1.595-.899-6.444-3.632-7.999-4.508-.151-.085-.319-.128-.486-.128-.168 0-.335.043-.486.128-1.555.876-6.405 3.609-8 4.508m15.986 2.115v7.525l-6.75 3.722v-7.578zm-15 7.425v-7.458l6.75 3.75v7.511zm.736-8.769 6.764-3.813 6.801 3.834-6.801 3.716z" fillRule="nonzero"/></svg>
            </g>
          </marker>

          <symbol id="dotSymbol" width="10" height="10" overflow={'visible'}>
            <g>
              <circle r = '3' cx={0} cy = {0} overflow={'visible'} />
            </g>
          </symbol>

          <symbol id="crossSymbol" width="10" height="10" overflow={'visible'}>  
            <g>
            <line x1='0' y1='3' x2='0' y2='-3' style={{stroke:'black', strokeWidth: '1'}}></line>
            <line x1='3' y1='0' x2='-3' y2='0' style={{stroke:'black', strokeWidth: '1'}}></line>
          </g>
            </symbol>
          
          <symbol id = 'hexagonHollowSymbol' width="2.5" height="2.5" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-12,-12)'>
              <path d="m16.476 3c.369 0 .709.197.887.514.9 1.595 3.633 6.445 4.509 8.001.075.131.118.276.126.423.012.187-.029.377-.126.547-.876 1.556-3.609 6.406-4.509 8-.178.318-.518.515-.887.515h-8.951c-.369 0-.709-.197-.887-.515-.899-1.594-3.634-6.444-4.51-8-.085-.151-.128-.318-.128-.485s.043-.334.128-.485c.876-1.556 3.611-6.406 4.51-8.001.178-.317.518-.514.887-.514zm-8.672 1.5-4.228 7.5 4.228 7.5h8.393l4.227-7.5-4.227-7.5z"/>
            </g>
          </symbol>
          
          <symbol id = 'rectangleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3 17v3c0 .621.52 1 1 1h3v-1.5h-2.5v-2.5zm8.5 4h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5zm5-4h-1.5v2.5h-2.5v1.5h3c.478 0 1-.379 1-1zm-1.5-1v-3.363h1.5v3.363zm-15-3.363v3.363h-1.5v-3.363zm15-1v-3.637h1.5v3.637zm-15-3.637v3.637h-1.5v-3.637zm12.5-5v1.5h2.5v2.5h1.5v-3c0-.478-.379-1-1-1zm-10 0h-3c-.62 0-1 .519-1 1v3h1.5v-2.5h2.5zm4.5 1.5h-3.5v-1.5h3.5zm4.5 0h-3.5v-1.5h3.5z" fillRule="nonzero"/></svg>
            </g>
          </symbol>
          
          <symbol id = 'triangleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m2.095 19.882 9.248-16.5c.133-.237.384-.384.657-.384.272 0 .524.147.656.384l9.248 16.5c.064.115.096.241.096.367 0 .385-.309.749-.752.749h-18.496c-.44 0-.752-.36-.752-.749 0-.126.031-.252.095-.367zm1.935-.384h15.939l-7.97-14.22z" fillRule="nonzero"/></svg>
            </g>
          </symbol>
          
          <symbol id='rhombusHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.262 2.306c.196-.196.461-.306.738-.306s.542.11.738.306c1.917 1.917 7.039 7.039 8.956 8.956.196.196.306.461.306.738s-.11.542-.306.738c-1.917 1.917-7.039 7.039-8.956 8.956-.196.196-.461.306-.738.306s-.542-.11-.738-.306c-1.917-1.917-7.039-7.039-8.956-8.956-.196-.196-.306-.461-.306-.738s.11-.542.306-.738c1.917-1.917 7.039-7.039 8.956-8.956zm-7.573 9.694 8.311 8.311 8.311-8.311-8.311-8.311z" fillRule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='starFilledSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.322 2.923c.126-.259.39-.423.678-.423.289 0 .552.164.678.423.974 1.998 2.65 5.44 2.65 5.44s3.811.524 6.022.829c.403.055.65.396.65.747 0 .19-.072.383-.231.536-1.61 1.538-4.382 4.191-4.382 4.191s.677 3.767 1.069 5.952c.083.462-.275.882-.742.882-.122 0-.244-.029-.355-.089-1.968-1.048-5.359-2.851-5.359-2.851s-3.391 1.803-5.359 2.851c-.111.06-.234.089-.356.089-.465 0-.825-.421-.741-.882.393-2.185 1.07-5.952 1.07-5.952s-2.773-2.653-4.382-4.191c-.16-.153-.232-.346-.232-.535 0-.352.249-.694.651-.748 2.211-.305 6.021-.829 6.021-.829s1.677-3.442 2.65-5.44z" fillRule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='circleHollowSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
            <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 2c5.517 0 9.997 4.48 9.997 9.998 0 5.517-4.48 9.997-9.997 9.997-5.518 0-9.998-4.48-9.998-9.997 0-5.518 4.48-9.998 9.998-9.998zm0 1.5c-4.69 0-8.498 3.808-8.498 8.498s3.808 8.497 8.498 8.497 8.497-3.807 8.497-8.497-3.807-8.498-8.497-8.498z" fillRule="nonzero"/></svg>
            </g>
          </symbol>

          <symbol id='cubeFilledSymbol' width="10" height="10" viewBox = '0 0 5 5' overflow={'visible'}>
            <g transform='translate(-2.5,-2.5)'>
              <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m3.514 6.61c-.317.179-.514.519-.514.887v8.95c0 .37.197.708.514.887 1.597.901 6.456 3.639 8.005 4.512.152.085.319.128.487.128.164 0 .328-.041.477-.123 1.549-.855 6.39-3.523 7.994-4.408.323-.177.523-.519.523-.891v-9.055c0-.368-.197-.708-.515-.887-1.595-.899-6.444-3.632-7.999-4.508-.151-.085-.319-.128-.486-.128-.168 0-.335.043-.486.128-1.555.876-6.405 3.609-8 4.508m15.986 2.115v7.525l-6.75 3.722v-7.578zm-15 7.425v-7.458l6.75 3.75v7.511zm.736-8.769 6.764-3.813 6.801 3.834-6.801 3.716z" fillRule="nonzero"/></svg>
            </g>
          </symbol>
          </>)

    
}