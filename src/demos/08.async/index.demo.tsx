import { MemoryRouter } from 'react-router'
import AsyncRaceLab from './lab/AsyncRaceLab'

export default function App() { return <MemoryRouter><AsyncRaceLab /></MemoryRouter> }
App.meta = { title: '请求竞态诊断', tags: ['async', 'effects', 'testing'] }
