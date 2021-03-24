import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import _ from 'lodash';
import './aside.styles.scss';
/**
 *
 * @param {Object} scrollParent [DOM node of scrollable element]
 * @param {Array} _targetElements [Array of nodes to spy on]
 */
const spyScroll = (scrollParent, _targetElements) => {
  if (!scrollParent) return false;

  // create an Object with all children that has data-name attribute
  const targetElements =
    _targetElements ||
    [...scrollParent.children].reduce(
      (map, item) =>
        item.dataset.name ? { [item.dataset.name]: item, ...map } : map,
      {}
    );

  let bestMatch = {};

  for (const sectionName in targetElements) {
    if (Object.prototype.hasOwnProperty.call(targetElements, sectionName)) {
      const domElm = targetElements[sectionName];
      const delta = Math.abs(scrollParent.scrollTop - domElm.offsetTop); // check distance from top, takig scroll into account

      if (!bestMatch.sectionName) 
        bestMatch = { sectionName, delta };

      // check which delet is closest to "0"
      if (delta < bestMatch.delta) {
        bestMatch = { sectionName, delta };
      }
    }
  }

  // update state with best-fit section
  return bestMatch.sectionName;
};

/**
 * Given a parent element ref, this render-props function returns
 * which of the parent's sections is currently scrolled into view
 * @param {Object} sectionsWrapperRef [Scrollable parent node React ref Object]
 */
const CurrentScrolledSection = ({ sectionsWrapperRef, children }) => {
  const [currentSection, setCurrentSection] = useState()
  const throttledOnScroll = _.throttle(
    e => setCurrentSection(spyScroll(e.target)),
    100
  )

  // adding the scroll event listener inside this component, and NOT the parent component, to prevent re-rendering of the parent component when
  // the scroll listener is fired and the state is updated, which causes noticable lag.
  useEffect(() => {
    const wrapperElm = sectionsWrapperRef.current;
    if (wrapperElm) {
      wrapperElm.addEventListener('scroll', throttledOnScroll)
      setCurrentSection( spyScroll(wrapperElm) )
    }
    
    // unbind
    return () => wrapperElm.removeEventListener('scroll', throttledOnScroll)
  }, [sectionsWrapperRef, throttledOnScroll])

  return children(currentSection)
}

export default function Aside({data}){
  const sectionsWrapperRef = useRef();
  
  // prepare DOM refs
  const sectionsRefs = {};
  useMemo(() => data.forEach(section => sectionsRefs[section.name] = React.createRef()), []);
  
  const scrollToTarget = refName => () => {
    if (refName && sectionsRefs[refName] && sectionsRefs[refName].current)
      // MDN: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      sectionsRefs[refName].current.scrollIntoView({behavior:"smooth", block:"start", inline:"nearest"});
  }
  
  // side section
  const SideSection = useCallback(({children, name, ...rest}) => 
    <section ref={sectionsRefs[name]} {...rest}>
      <header>{name}</header>
      <div className='sideSectionContent'>
        {children}
      </div>
    </section>, [])

  
  // render-props method: get currently viewed section while scrolling:
  return (
    <CurrentScrolledSection sectionsWrapperRef={sectionsWrapperRef}>
      {currentSection => 
      <aside className={'asideComp'}>
        <nav>
          {data.map(item => (
            <button
              type="button"
              key={item.name} 
              title={_.capitalize(item.name)}
              className={currentSection === item.name ? 'active' : ''}
              onClick={scrollToTarget(item.name)}>
                {item.icon}
              </button>
          ))}
        </nav>
        <div className='asideContent' ref={sectionsWrapperRef}>
          {/* <div style={{color:'black', border: '1px solid red', height: '150px'}}> I WOULD LIKE TO STICK THIS DIV ABOVE ALL THE LIST ITEMS BELOW interpreted scripting language that conforms to the ECMAScript specification. JavaScript has curly-bracket syntax, dynamic typing, prototype-based object-orientation, and first-class functions.</div> */}
          
          {data.map(item => (
          <SideSection name={item.name} data-name={item.name} className={currentSection === item.name ? 'active' : ''}>
            {item.content}
          </SideSection>
          ))}
        </div>
      </aside>
    }
    </CurrentScrolledSection>
  );
};