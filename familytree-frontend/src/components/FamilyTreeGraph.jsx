import { useEffect, useMemo, useRef } from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import CytoscapeComponent from 'react-cytoscapejs'

cytoscape.use(dagre)

export const RELATIONSHIP_LABELS = {
  parent: 'Родитель',
  child: 'Ребёнок',
  spouse: 'Супруг(а)',
  sibling: 'Брат/Сестра',
}

const STYLESHEET = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'background-color': '#4f7cff',
      color: '#fff',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': 10,
      width: 52,
      height: 52,
      'text-wrap': 'wrap',
      'text-max-width': '60px',
    },
  },
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      'font-size': 8,
      width: 2,
      'curve-style': 'bezier',
      'text-background-color': '#fff',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px',
    },
  },
  {
    selector: 'edge[type = "parent"]',
    style: {
      'line-color': '#2f6f4f',
      'target-arrow-color': '#2f6f4f',
      'target-arrow-shape': 'triangle',
      'line-style': 'solid',
    },
  },
  {
    selector: 'edge[type = "child"]',
    style: {
      'line-color': '#2f6f4f',
      'target-arrow-color': '#2f6f4f',
      'target-arrow-shape': 'triangle',
      'line-style': 'dashed',
    },
  },
  {
    selector: 'edge[type = "spouse"]',
    style: {
      'line-color': '#c0399f',
      'line-style': 'solid',
      'target-arrow-shape': 'none',
    },
  },
  {
    selector: 'edge[type = "sibling"]',
    style: {
      'line-color': '#c9a227',
      'line-style': 'dotted',
      'target-arrow-shape': 'none',
    },
  },
]

export function buildElements(persons, relationships) {
  const nodes = persons.map((person) => ({
    data: { id: String(person.id), label: `${person.first_name} ${person.last_name}` },
  }))
  const edges = relationships.map((relationship) => ({
    data: {
      id: `rel-${relationship.id}`,
      source: String(relationship.person_from),
      target: String(relationship.person_to),
      type: relationship.relationship_type,
      label: RELATIONSHIP_LABELS[relationship.relationship_type] ?? relationship.relationship_type,
      relationshipId: relationship.id,
    },
  }))
  return [...nodes, ...edges]
}

export default function FamilyTreeGraph({ persons, relationships, onNodeClick, onEdgeClick }) {
  const cyRef = useRef(null)

  const elements = useMemo(() => buildElements(persons, relationships), [persons, relationships])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    function handleNodeTap(event) {
      onNodeClick?.(event.target.id())
    }
    function handleEdgeTap(event) {
      onEdgeClick?.(event.target.data('relationshipId'))
    }

    cy.on('tap', 'node', handleNodeTap)
    cy.on('tap', 'edge', handleEdgeTap)

    const parentEdges = cy.edges('[type = "parent"]')
    if (parentEdges.length > 0) {
      cy.nodes()
        .union(parentEdges)
        .layout({ name: 'dagre', rankDir: 'TB', nodeSep: 40, rankSep: 80 })
        .run()
    } else if (cy.nodes().length > 0) {
      cy.layout({ name: 'grid' }).run()
    }

    return () => {
      cy.removeListener('tap', 'node', handleNodeTap)
      cy.removeListener('tap', 'edge', handleEdgeTap)
    }
  }, [elements, onNodeClick, onEdgeClick])

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100%', height: '600px' }}
      stylesheet={STYLESHEET}
      cy={(cy) => {
        cyRef.current = cy
      }}
      userZoomingEnabled
      userPanningEnabled
    />
  )
}
