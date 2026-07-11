import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FamilyTreeGraph, { buildElements } from './FamilyTreeGraph'

const tapHandlers = {}
const fakeCy = {
  on: vi.fn((event, selector, handler) => {
    tapHandlers[`${event}:${selector}`] = handler
  }),
  removeListener: vi.fn(),
  edges: vi.fn(() => ({ length: 0 })),
  nodes: vi.fn(() => ({
    length: 2,
    union: () => ({ layout: () => ({ run: vi.fn() }) }),
  })),
  layout: vi.fn(() => ({ run: vi.fn() })),
}

vi.mock('react-cytoscapejs', () => ({
  default: (props) => {
    props.cy?.(fakeCy)
    return <div data-testid="graph" />
  },
}))

describe('FamilyTreeGraph', () => {
  const persons = [
    { id: 1, first_name: 'Anna', last_name: 'Ivanova' },
    { id: 2, first_name: 'Boris', last_name: 'Ivanov' },
  ]
  const relationships = [{ id: 10, person_from: 2, person_to: 1, relationship_type: 'parent' }]

  it('builds cytoscape nodes and edges from persons and relationships', () => {
    const elements = buildElements(persons, relationships)

    expect(elements).toHaveLength(3)
    expect(elements[0].data).toMatchObject({ id: '1', label: 'Anna Ivanova' })
    expect(elements[1].data).toMatchObject({ id: '2', label: 'Boris Ivanov' })
    expect(elements[2].data).toMatchObject({
      source: '2',
      target: '1',
      type: 'parent',
      relationshipId: 10,
      label: 'Родитель',
    })
  })

  it('invokes onNodeClick with the tapped node id', () => {
    const onNodeClick = vi.fn()
    render(
      <FamilyTreeGraph
        persons={persons}
        relationships={relationships}
        onNodeClick={onNodeClick}
        onEdgeClick={vi.fn()}
      />,
    )

    tapHandlers['tap:node']({ target: { id: () => '2' } })

    expect(onNodeClick).toHaveBeenCalledWith('2')
  })

  it('invokes onEdgeClick with the relationship id', () => {
    const onEdgeClick = vi.fn()
    render(
      <FamilyTreeGraph
        persons={persons}
        relationships={relationships}
        onNodeClick={vi.fn()}
        onEdgeClick={onEdgeClick}
      />,
    )

    tapHandlers['tap:edge']({ target: { data: () => 10 } })

    expect(onEdgeClick).toHaveBeenCalledWith(10)
  })
})
