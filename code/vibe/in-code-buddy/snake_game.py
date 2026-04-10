import pygame
import random
import sys

# 初始化
pygame.init()

# 颜色定义
BLACK      = (0,   0,   0)
WHITE      = (255, 255, 255)
GREEN      = (0,   200,  0)
DARK_GREEN = (0,   140,  0)
RED        = (220,  50,  50)
GRAY       = (40,   40,  40)
LIGHT_GRAY = (80,   80,  80)
YELLOW     = (255, 220,  0)
BLUE       = (50,  150, 255)

# 游戏配置
CELL_SIZE   = 20
COLS        = 30
ROWS        = 25
WIDTH       = CELL_SIZE * COLS
HEIGHT      = CELL_SIZE * ROWS + 60  # 额外60px用于顶部状态栏
FPS         = 10

# 方向常量
UP    = (0, -1)
DOWN  = (0,  1)
LEFT  = (-1, 0)
RIGHT = (1,  0)


class Snake:
    def __init__(self):
        self.reset()

    def reset(self):
        start_x = COLS // 2
        start_y = ROWS // 2
        self.body = [
            (start_x,     start_y),
            (start_x - 1, start_y),
            (start_x - 2, start_y),
        ]
        self.direction  = RIGHT
        self.next_dir   = RIGHT
        self.grew        = False

    def set_direction(self, new_dir):
        # 禁止反向移动
        if (new_dir[0] * -1, new_dir[1] * -1) != self.direction:
            self.next_dir = new_dir

    def move(self):
        self.direction = self.next_dir
        head_x, head_y = self.body[0]
        dx, dy = self.direction
        new_head = (head_x + dx, head_y + dy)
        self.body.insert(0, new_head)
        if not self.grew:
            self.body.pop()
        self.grew = False

    def grow(self):
        self.grew = True

    def check_collision(self):
        head = self.body[0]
        # 撞墙
        if not (0 <= head[0] < COLS and 0 <= head[1] < ROWS):
            return True
        # 撞自身
        if head in self.body[1:]:
            return True
        return False

    @property
    def head(self):
        return self.body[0]


class Food:
    def __init__(self, snake_body):
        self.position = self._random_pos(snake_body)

    def _random_pos(self, snake_body):
        while True:
            pos = (random.randint(0, COLS - 1), random.randint(0, ROWS - 1))
            if pos not in snake_body:
                return pos

    def respawn(self, snake_body):
        self.position = self._random_pos(snake_body)


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("贪吃蛇")
        self.clock  = pygame.time.Clock()

        # 字体
        try:
            self.font_large = pygame.font.SysFont("microsoftyahei", 48, bold=True)
            self.font_mid   = pygame.font.SysFont("microsoftyahei", 28)
            self.font_small = pygame.font.SysFont("microsoftyahei", 20)
        except Exception:
            self.font_large = pygame.font.SysFont(None, 56)
            self.font_mid   = pygame.font.SysFont(None, 34)
            self.font_small = pygame.font.SysFont(None, 24)

        self.reset()

    def reset(self):
        self.snake      = Snake()
        self.food       = Food(self.snake.body)
        self.score      = 0
        self.high_score = getattr(self, "high_score", 0)
        self.state      = "playing"   # "playing" | "paused" | "game_over"
        self.speed      = FPS

    # ── 主循环 ─────────────────────────────────────────────
    def run(self):
        while True:
            self._handle_events()
            if self.state == "playing":
                self._update()
            self._draw()
            self.clock.tick(self.speed)

    # ── 事件处理 ───────────────────────────────────────────
    def _handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.KEYDOWN:
                if self.state == "playing":
                    if event.key in (pygame.K_UP,    pygame.K_w): self.snake.set_direction(UP)
                    if event.key in (pygame.K_DOWN,  pygame.K_s): self.snake.set_direction(DOWN)
                    if event.key in (pygame.K_LEFT,  pygame.K_a): self.snake.set_direction(LEFT)
                    if event.key in (pygame.K_RIGHT, pygame.K_d): self.snake.set_direction(RIGHT)
                    if event.key == pygame.K_p:      self.state = "paused"
                    if event.key == pygame.K_ESCAPE: self.state = "paused"

                elif self.state == "paused":
                    if event.key in (pygame.K_p, pygame.K_ESCAPE, pygame.K_RETURN):
                        self.state = "playing"
                    if event.key == pygame.K_r:
                        self.reset()

                elif self.state == "game_over":
                    if event.key == pygame.K_r:
                        self.reset()
                    if event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()

    # ── 逻辑更新 ───────────────────────────────────────────
    def _update(self):
        self.snake.move()

        if self.snake.check_collision():
            self.state = "game_over"
            if self.score > self.high_score:
                self.high_score = self.score
            return

        if self.snake.head == self.food.position:
            self.snake.grow()
            self.score += 10
            self.food.respawn(self.snake.body)
            # 每50分加速一次，上限20
            self.speed = min(FPS + self.score // 50, 20)

    # ── 绘制 ───────────────────────────────────────────────
    def _draw(self):
        self.screen.fill(BLACK)
        self._draw_status_bar()
        self._draw_grid()
        self._draw_food()
        self._draw_snake()

        if self.state == "paused":
            self._draw_overlay("暂停", "按 P / Enter 继续   |   R 重新开始")
        elif self.state == "game_over":
            self._draw_overlay("游戏结束", "按 R 重新开始   |   Esc 退出")

        pygame.display.flip()

    def _draw_status_bar(self):
        # 顶部状态栏背景
        pygame.draw.rect(self.screen, GRAY, (0, 0, WIDTH, 55))
        pygame.draw.line(self.screen, LIGHT_GRAY, (0, 55), (WIDTH, 55), 2)

        score_surf = self.font_mid.render(f"得分: {self.score}", True, YELLOW)
        high_surf  = self.font_mid.render(f"最高: {self.high_score}", True, BLUE)
        hint_surf  = self.font_small.render("方向键/WASD 移动  P 暂停  R 重新开始", True, LIGHT_GRAY)

        self.screen.blit(score_surf, (15, 8))
        self.screen.blit(high_surf,  (WIDTH // 2 - high_surf.get_width() // 2, 8))
        self.screen.blit(hint_surf,  (WIDTH - hint_surf.get_width() - 10, 34))

    def _draw_grid(self):
        offset_y = 60
        for x in range(0, WIDTH, CELL_SIZE):
            pygame.draw.line(self.screen, GRAY, (x, offset_y), (x, HEIGHT), 1)
        for y in range(offset_y, HEIGHT, CELL_SIZE):
            pygame.draw.line(self.screen, GRAY, (0, y), (WIDTH, y), 1)

    def _draw_snake(self):
        offset_y = 60
        for i, (cx, cy) in enumerate(self.snake.body):
            rect = pygame.Rect(cx * CELL_SIZE + 1, cy * CELL_SIZE + offset_y + 1,
                               CELL_SIZE - 2, CELL_SIZE - 2)
            color = GREEN if i > 0 else DARK_GREEN
            pygame.draw.rect(self.screen, color, rect, border_radius=4)
            # 蛇头绘制眼睛
            if i == 0:
                self._draw_eyes(cx, cy, offset_y)

    def _draw_eyes(self, cx, cy, offset_y):
        dx, dy = self.snake.direction
        center_x = cx * CELL_SIZE + CELL_SIZE // 2
        center_y = cy * CELL_SIZE + offset_y + CELL_SIZE // 2
        # 根据朝向确定眼睛位置
        if dx == 1:    eye1 = (center_x + 4, center_y - 4); eye2 = (center_x + 4, center_y + 4)
        elif dx == -1: eye1 = (center_x - 4, center_y - 4); eye2 = (center_x - 4, center_y + 4)
        elif dy == -1: eye1 = (center_x - 4, center_y - 4); eye2 = (center_x + 4, center_y - 4)
        else:          eye1 = (center_x - 4, center_y + 4); eye2 = (center_x + 4, center_y + 4)
        pygame.draw.circle(self.screen, WHITE, eye1, 3)
        pygame.draw.circle(self.screen, WHITE, eye2, 3)
        pygame.draw.circle(self.screen, BLACK, eye1, 1)
        pygame.draw.circle(self.screen, BLACK, eye2, 1)

    def _draw_food(self):
        offset_y = 60
        fx, fy = self.food.position
        center = (fx * CELL_SIZE + CELL_SIZE // 2,
                  fy * CELL_SIZE + offset_y + CELL_SIZE // 2)
        pygame.draw.circle(self.screen, RED, center, CELL_SIZE // 2 - 2)
        # 高光点
        pygame.draw.circle(self.screen, WHITE,
                           (center[0] - 3, center[1] - 3), 3)

    def _draw_overlay(self, title, subtitle):
        # 半透明遮罩
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 160))
        self.screen.blit(overlay, (0, 0))

        # 文字框
        box_w, box_h = 420, 160
        box_x = (WIDTH  - box_w) // 2
        box_y = (HEIGHT - box_h) // 2
        pygame.draw.rect(self.screen, GRAY,       (box_x, box_y, box_w, box_h), border_radius=12)
        pygame.draw.rect(self.screen, LIGHT_GRAY, (box_x, box_y, box_w, box_h), 2, border_radius=12)

        t_surf  = self.font_large.render(title,    True, YELLOW)
        st_surf = self.font_small.render(subtitle, True, WHITE)
        self.screen.blit(t_surf,  (box_x + (box_w - t_surf.get_width())  // 2, box_y + 28))
        self.screen.blit(st_surf, (box_x + (box_w - st_surf.get_width()) // 2, box_y + 108))


if __name__ == "__main__":
    Game().run()
