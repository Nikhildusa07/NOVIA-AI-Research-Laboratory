class KnowledgeGraph:

    def __init__(self):
        self.nodes = []
        self.relationships = []

    def add_node(self, node_id, node_type, name, properties=None):

        node = {
            "id": node_id,
            "type": node_type,
            "name": name,
            "properties": properties or {}
        }

        existing_node = self.get_node(node_id)

        if existing_node:
            return existing_node

        self.nodes.append(node)

        return node

    def add_relationship(
        self,
        source_id,
        relationship,
        target_id
    ):

        relation = {
            "source": source_id,
            "relationship": relationship,
            "target": target_id
        }

        self.relationships.append(relation)

        return relation

    def get_node(self, node_id):

        for node in self.nodes:
            if node["id"] == node_id:
                return node

        return None

    def get_relationships(self):

        return self.relationships

    def get_graph(self):

        return {
            "nodes": self.nodes,
            "relationships": self.relationships
        }

    def clear(self):

        self.nodes = []
        self.relationships = []

        return {
            "status": "knowledge_graph_cleared"
        }