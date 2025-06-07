import heapq

# Node = (total_cost, x, y, path_so_far)
def a_star(start, end, grid):
    rows, cols = len(grid), len(grid[0])
    open_set = [(0 + heuristic(start, end), 0, start, [start])]
    visited = set()

    while open_set:
        f, g, current, path = heapq.heappop(open_set)

        if current == end:
            return path

        if current in visited:
            continue
        visited.add(current)

        for neighbor in get_neighbors(current, rows, cols):
            if grid[neighbor[0]][neighbor[1]] == 1:  # wall/block
                continue
            if neighbor in visited:
                continue

            new_g = g + 1
            new_f = new_g + heuristic(neighbor, end)
            heapq.heappush(open_set, (new_f, new_g, neighbor, path + [neighbor]))

    return None

def heuristic(a, b):
    # Manhattan distance
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def get_neighbors(pos, rows, cols):
    x, y = pos
    directions = [(-1,0), (1,0), (0,-1), (0,1)]  # up, down, left, right
    neighbors = []

    for dx, dy in directions:
        nx, ny = x + dx, y + dy
        if 0 <= nx < rows and 0 <= ny < cols:
            neighbors.append((nx, ny))

    return neighbors
