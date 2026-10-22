import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// Las búsquedas `findBy…` esperan 1 s por defecto; con muchos hilos en paralelo, la página
// completa (y la latencia simulada del catálogo, 350 ms) puede tardar más y el test falla
// sin que haya un error real.
configure({ asyncUtilTimeout: 3000 })
