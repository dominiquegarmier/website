#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define SNAKE_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define SNAKE_EXPORT
#endif

#define main snake_cli_main
#include "../vendor/snake/snake.c"
#undef main

enum {
  CELL_EMPTY = 0,
  CELL_BODY = 1,
  CELL_HEAD = 2,
  CELL_FOOD = 3
};

typedef struct {
  unsigned char cells[CELLS];
  float elapsed, sample_s, mean_score, mean_peak_len, mean_len_cov, mean_visit_cov, p30_len, p30_visit, mean_steps;
  int iter, envs, best_score, best_len;
} WebSnapshot;

static Model *web_model = NULL;
static Env *web_envs = NULL;
static int web_env_count = 0;
static int web_iter = 0;
static double web_t0 = 0.0;
static double web_next_eval = 0.0;
static double web_samples = 0.0;
static Rng web_rng;
static Env web_watch;
static Eval web_eval;
static WebSnapshot web_snapshot;

static void web_release(void) {
  free(web_envs);
  free(web_model);
  web_envs = NULL;
  web_model = NULL;
  web_env_count = 0;
}

static void web_snapshot_fill(double elapsed) {
  memset(&web_snapshot, 0, sizeof web_snapshot);
  if (!web_watch.alive || web_watch.since_food >= idle_limit(&web_watch)) env_reset(&web_watch);
  (void)env_step(&web_watch, greedy(web_model, &web_watch));

  if (web_watch.food >= 0) web_snapshot.cells[web_watch.food] = CELL_FOOD;
  for (int i = web_watch.len - 1; i >= 0; i--) {
    web_snapshot.cells[cell(web_watch.xs[i], web_watch.ys[i])] = i == 0 ? CELL_HEAD : CELL_BODY;
  }

  web_snapshot.iter = web_iter;
  web_snapshot.elapsed = (float)elapsed;
  web_snapshot.envs = web_env_count;
  web_snapshot.sample_s = (float)(web_samples / (elapsed > 0.001 ? elapsed : 0.001));
  web_snapshot.mean_score = web_eval.mean_score;
  web_snapshot.best_score = web_eval.best_score;
  web_snapshot.mean_peak_len = web_eval.mean_peak_len;
  web_snapshot.best_len = web_eval.best_len;
  web_snapshot.mean_len_cov = web_eval.mean_len_cov;
  web_snapshot.p30_len = web_eval.p30_len;
  web_snapshot.mean_visit_cov = web_eval.mean_visit_cov;
  web_snapshot.p30_visit = web_eval.p30_visit;
  web_snapshot.mean_steps = web_eval.mean_steps;
}

SNAKE_EXPORT void snake_web_init(int env_count) {
  if (env_count <= 0) env_count = 256;
  if (env_count > 512) env_count = 512;
  web_release();
  web_model = model_create(8);
  web_envs = calloc((size_t)env_count, sizeof(Env));
  if (!web_envs) {
    perror("calloc web envs");
    exit(1);
  }
  web_env_count = env_count;
  for (int i = 0; i < web_env_count; i++) web_envs[i] = env_create(1000 + i);
  web_rng = rng_create(99);
  web_watch = env_create(4242);
  memset(&web_eval, 0, sizeof web_eval);
  eval_model(web_model, 4, &web_eval);
  web_iter = 0;
  web_t0 = now_sec();
  web_next_eval = 5.0;
  web_samples = 0.0;
}

SNAKE_EXPORT void snake_web_reset(void) {
  snake_web_init(web_env_count > 0 ? web_env_count : 256);
}

SNAKE_EXPORT void snake_web_train(int iterations) {
  if (!web_model) snake_web_init(256);
  if (iterations <= 0) iterations = 1;
  if (iterations > 16) iterations = 16;

  for (int i = 0; i < iterations; i++) {
    Rollout r = collect(web_model, web_envs, web_env_count, ROLLOUT_STEPS);
    advantages(&r);
    update(web_model, &r, &web_rng);
    rollout_free(&r);
    web_iter++;
    web_samples += (double)web_env_count * ROLLOUT_STEPS;
    double elapsed = now_sec() - web_t0;
    if (elapsed >= web_next_eval) {
      eval_model(web_model, 4, &web_eval);
      web_next_eval = elapsed + 5.0;
    }
  }
}

SNAKE_EXPORT unsigned char *snake_web_snapshot(void) {
  if (!web_model) snake_web_init(256);
  web_snapshot_fill(now_sec() - web_t0);
  return web_snapshot.cells;
}

SNAKE_EXPORT int snake_web_iter(void) { return web_snapshot.iter; }
SNAKE_EXPORT float snake_web_elapsed(void) { return web_snapshot.elapsed; }
SNAKE_EXPORT int snake_web_envs(void) { return web_snapshot.envs; }
SNAKE_EXPORT float snake_web_sample_s(void) { return web_snapshot.sample_s; }
SNAKE_EXPORT float snake_web_score(void) { return web_snapshot.mean_score; }
SNAKE_EXPORT int snake_web_best(void) { return web_snapshot.best_score; }
SNAKE_EXPORT float snake_web_peak_len(void) { return web_snapshot.mean_peak_len; }
SNAKE_EXPORT int snake_web_best_len(void) { return web_snapshot.best_len; }
SNAKE_EXPORT float snake_web_len_cov(void) { return web_snapshot.mean_len_cov; }
SNAKE_EXPORT float snake_web_visit_cov(void) { return web_snapshot.mean_visit_cov; }
SNAKE_EXPORT float snake_web_p30_len(void) { return web_snapshot.p30_len; }
SNAKE_EXPORT float snake_web_p30_visit(void) { return web_snapshot.p30_visit; }
SNAKE_EXPORT float snake_web_steps(void) { return web_snapshot.mean_steps; }
