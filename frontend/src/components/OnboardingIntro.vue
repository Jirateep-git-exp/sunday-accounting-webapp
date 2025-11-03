<template>
  <div class="intro">
    <div class="hero">
      <h1>Get started with Cloud Pocket in minutes</h1>
      <p class="sub">Log income and expenses via LINE and let the system auto-categorize for you</p>
    </div>

    <div class="steps">
      <div class="step">
        <span class="badge">1</span>
        <div>
          <h3>Log via LINE</h3>
          <p>Type like “coffee 100” or “salary 25000”</p>
        </div>
      </div>
      <div class="step">
        <span class="badge">2</span>
        <div>
          <h3>Auto-categorize</h3>
          <p>The system guesses the category from your text</p>
        </div>
      </div>
      <div class="step">
        <span class="badge">3</span>
        <div>
          <h3>Initial setup</h3>
          <p>Take less than 5 minutes to choose your Pockets</p>
        </div>
      </div>
    </div>

    <div class="cta">
      <button class="primary" @click="go()">Start selecting (Income)</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    go() { this.$router.push({ name: 'Onboarding', query: { step: 'income' } }) }
  }
}
</script>

<style scoped>
.intro { padding: 28px; max-width: 980px; margin: 0 auto }
.hero h1 { font-size: 32px; margin: 0 0 6px; font-weight: 900 }
.sub { color: #6b7280; margin: 0 0 18px }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 10px }
.step { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px }
.badge { width: 28px; height: 28px; border-radius: 50%; background: #EEF2FF; color: #4F46E5; display: inline-flex; align-items: center; justify-content: center; font-weight: 800 }
.cta { display: flex; gap: 10px; margin-top: 18px }
.primary { background: linear-gradient(135deg,#4F46E5,#6366F1); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600 }
.ghost { background: transparent; border: 1px solid #e5e7eb; padding: 10px 16px; border-radius: 8px }
</style>