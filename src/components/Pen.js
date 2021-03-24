
import Aside from './Aside';
import data from './../data';
import './aside.styles.scss';

export default function Pen(){
  return (
  <main className='main'>
    <Aside data={data}/>
  </main>
  );
}