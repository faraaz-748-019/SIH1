import networkx as nx
from typing import List, Dict, Any, Tuple

def build_dependency_graph(findings: List[Dict[str, Any]], repo_name: str = "Enterprise-App") -> Tuple[Dict[str, Any], Dict[str, Dict[str, Any]]]:
    """
    Constructs a directed NetworkX graph:
    Asset/Algorithm -> Library -> File -> Service -> App
    Returns (cytoscape_graph_json, blast_radius_lookup)
    """
    G = nx.DiGraph()

    # Root App Node
    app_node_id = "node-app-root"
    G.add_node(app_node_id, label=repo_name, type="app", criticality="safe", data={"description": f"Root Repository: {repo_name}"})

    nodes_dict = {
        app_node_id: {
            "id": app_node_id,
            "label": repo_name,
            "type": "app",
            "criticality": "safe",
            "data": {"name": repo_name}
        }
    }
    edges_list = []
    blast_radius_lookup = {}

    service_map = {
        "python_app": "Python Auth & Token Service",
        "java_app": "Java Payment & Crypto Microservice",
        "js_app": "Node.js Web & JWT Gateway",
        "go_app": "Go Network & TLS Client",
        "certs": "PKI & Certificate Vault"
    }

    # Track unique entities
    seen_services = set()
    seen_files = set()
    seen_libraries = set()

    for item in findings:
        asset_id = item["asset_id"]
        file_path = item["location"]["file"]
        lib_name = item["library"]
        algo_name = item["algorithm"]
        crit = item.get("criticality", "medium")

        # Determine Service from path
        service_id_raw = "core_service"
        service_label = "Core Enterprise Service"
        for prefix, s_label in service_map.items():
            if prefix in file_path:
                service_id_raw = prefix
                service_label = s_label
                break

        service_node_id = f"node-svc-{service_id_raw}"
        file_node_id = f"node-file-{file_path.replace('/', '_').replace('.', '_')}"
        lib_node_id = f"node-lib-{lib_name.replace(' ', '_').replace('/', '_').replace(':', '_')}"
        asset_node_id = f"node-asset-{asset_id}"

        # 1. Service Node & Edge to App
        if service_node_id not in seen_services:
            seen_services.add(service_node_id)
            nodes_dict[service_node_id] = {
                "id": service_node_id,
                "label": service_label,
                "type": "service",
                "criticality": "medium",
                "data": {"service": service_label}
            }
            G.add_node(service_node_id, label=service_label, type="service")
            G.add_edge(service_node_id, app_node_id, label="part_of")
            edges_list.append({
                "id": f"edge-{service_node_id}-{app_node_id}",
                "source": service_node_id,
                "target": app_node_id,
                "label": "part_of"
            })

        # 2. File Node & Edge to Service
        if file_node_id not in seen_files:
            seen_files.add(file_node_id)
            nodes_dict[file_node_id] = {
                "id": file_node_id,
                "label": file_path.split("/")[-1],
                "type": "file",
                "criticality": "medium",
                "data": {"filePath": file_path}
            }
            G.add_node(file_node_id, label=file_path, type="file")
            G.add_edge(file_node_id, service_node_id, label="belongs_to")
            edges_list.append({
                "id": f"edge-{file_node_id}-{service_node_id}",
                "source": file_node_id,
                "target": service_node_id,
                "label": "belongs_to"
            })

        # 3. Library Node & Edge to File
        if lib_node_id not in seen_libraries:
            seen_libraries.add(lib_node_id)
            nodes_dict[lib_node_id] = {
                "id": lib_node_id,
                "label": lib_name,
                "type": "library",
                "criticality": "medium",
                "data": {"library": lib_name}
            }
            G.add_node(lib_node_id, label=lib_name, type="library")

        # Edge from lib to file
        edge_lib_file_id = f"edge-{lib_node_id}-{file_node_id}"
        if not G.has_edge(lib_node_id, file_node_id):
            G.add_edge(lib_node_id, file_node_id, label="imported_in")
            edges_list.append({
                "id": edge_lib_file_id,
                "source": lib_node_id,
                "target": file_node_id,
                "label": "imported_in"
            })

        # 4. Asset Node & Edge to Library
        nodes_dict[asset_node_id] = {
            "id": asset_node_id,
            "label": algo_name,
            "type": "algorithm",
            "criticality": crit,
            "data": {
                "assetId": asset_id,
                "algorithm": algo_name,
                "riskScore": item.get("risk_score", 0),
                "file": file_path,
                "line": item["location"]["line"]
            }
        }
        G.add_node(asset_node_id, label=algo_name, type="algorithm", criticality=crit)
        G.add_edge(asset_node_id, lib_node_id, label="implemented_by")
        edges_list.append({
            "id": f"edge-{asset_node_id}-{lib_node_id}",
            "source": asset_node_id,
            "target": lib_node_id,
            "label": "implemented_by"
        })

    # Compute Blast Radius for each asset
    for item in findings:
        asset_id = item["asset_id"]
        asset_node_id = f"node-asset-{asset_id}"
        
        # Traverse reachable ancestors/descendants in DiGraph
        affected_nodes = []
        if asset_node_id in G:
            # All downstream targets reachable from this asset
            reachable = nx.descendants(G, asset_node_id)
            affected_nodes = list(reachable)

        affected_files = [nodes_dict[n]["data"].get("filePath") for n in affected_nodes if n in nodes_dict and nodes_dict[n]["type"] == "file"]
        affected_services = [nodes_dict[n]["label"] for n in affected_nodes if n in nodes_dict and nodes_dict[n]["type"] == "service"]
        affected_libs = [nodes_dict[n]["label"] for n in affected_nodes if n in nodes_dict and nodes_dict[n]["type"] == "library"]

        algo = item["algorithm"]
        file_name = item["location"]["file"]
        impact_summary = (
            f"If {algo} in '{file_name}' is deprecated or rotated, it directly cascades into "
            f"{len(affected_libs)} library bindings, impacting {len(affected_files)} source files "
            f"across {len(affected_services)} upstream service(s) ({', '.join(affected_services) if affected_services else 'Core'}). "
            f"Requires coordinated API token/key rotation and regression testing."
        )

        blast_radius_lookup[asset_id] = {
            "asset_id": asset_id,
            "algorithm": algo,
            "affected_file_count": max(1, len(affected_files)),
            "affected_service_count": max(1, len(affected_services)),
            "affected_library_count": len(affected_libs),
            "affected_files": affected_files if affected_files else [file_name],
            "affected_services": affected_services if affected_services else ["Core Application"],
            "impact_summary": impact_summary,
            "downstream_node_ids": [asset_node_id] + affected_nodes
        }

    graph_payload = {
        "nodes": list(nodes_dict.values()),
        "edges": edges_list
    }

    return graph_payload, blast_radius_lookup
