<template>
  <div class="not-found-container" role="main">
    <div class="not-found-visual" aria-hidden="true">
      <svg viewBox="0 0 200 100" width="200" height="100">
        <text x="50%" y="50%" dy=".35em" text-anchor="middle" class="glitch">
          404
        </text>
      </svg>
    </div>
    <h1>Oops! Page Not Found</h1>
    <p>
      The page you’re looking for doesn’t exist or was moved.<br />
      Let’s get you back to something awesome.
    </p>
    <div class="not-found-actions">
      <router-link to="/" class="btn-home">Go Home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5vh 2rem;
  min-height: 70vh;
  color: var(--text-color, #00FFFF);
  background: var(--bg-color, rgba(0, 0, 0, 0.1));
  transition: background 0.25s;
}
.not-found-visual svg {
  width: 1800px;
  height: 180px;
}
.glitch {
  font-family: 'Fira Code', 'monospace';
  font-size: 5rem;
  fill: none;
  stroke: #ff6f61;
  stroke-width: 2;
  animation: glitch 1.5s infinite linear alternate;
}
@keyframes glitch {
  from { stroke: #00FFFF; }
  to { stroke: #32CD32; filter: blur(2px); }
}
h1 {
  margin: 2rem 0 0.5rem;
  font-size: 2.2rem;
}
p {
  margin-bottom: 2rem;
  text-align: center;
  max-width: 30rem;
}
.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.btn-home, .btn-contact {
  display: inline-block;
  padding: 0.7em 1.4em;
  border-radius: 25px;
  background: #ff6f61;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(255, 111, 97, 0.1);
  transition: background 0.2s, color 0.2s;
}
.btn-contact {
  background: #1976d2;
}
.btn-home:focus, .btn-contact:focus {
  outline: 2px solid #512da8;
  outline-offset: 2px;
}
@media (prefers-color-scheme: dark) {
  .not-found-container {
    --bg-color: #181923;
    --text-color: #f3f6fb;
    background: var(--bg-color);
    color: var(--text-color);
  }
  .btn-home, .btn-contact {
    box-shadow: 0 2px 10px rgba(25, 118, 210, 0.08);
  }
}
</style>