<script>
import api from '@/api'
import isBefore from 'date-fns/isBefore'
import addDays from 'date-fns/addDays'

export default {
  name: 'hello',
  data() {
    return {
      rates: JSON.parse(localStorage.getItem('sk-currency-rates')) || {},
      loading: false,
      pickedBase: 'GBP',
      pickedTarget: 'USD',
      calculator: {
        input: '',
        output: ''
      },
      cachePeriod: JSON.parse(localStorage.getItem('sk-currency-cache')) || -1,
      cachePeriods: [
        {
          label: 'No cache',
          value: -1
        },
        {
          label: '1 day',
          value: 1
        },
        {
          label: '5 days',
          value: 5
        },
        {
          label: '10 days',
          value: 10
        }
      ]
    }
  },
  mounted() {
    this.retrieveRates(this.pickedBase)
  },
  computed: {
    retrievedRates() {
      let rates = {}
      if (this.rates && this.rates[this.pickedBase]) {
        rates = this.rates[this.pickedBase].rates
      }
      return rates
    },
    calculatorInputFormatted() {
      let value = this.calculator.input ? this.calculator.input : '-'
      return value + ' ' + this.pickedBase
    },
    calculatorOuputFormatted() {
      let output = '-'

      if (!this.calculator.input) {
        return output
      }

      // Maths!
      output = this.calculator.input * this.retrievedRates[this.pickedTarget]
      return Math.round(output * 100) / 100
    }
  },
  methods: {
    async retrieveRates(base) {
      if (this.hasCache(base)) {
        return
      }
      this.loading = true
      let rates = await api.rates.latest({ base })
      // Let's add our base rate for the selector
      rates.rates[base] = 1
      this.$set(this.rates, base, rates)
      localStorage.setItem('sk-currency-rates', JSON.stringify(this.rates))
      this.loading = false
    },
    hasCache(base) {
      if (!this.rates[base] || this.cachePeriod === -1) {
        return false
      }

      return isBefore(
        new Date(),
        addDays(new Date(this.rates[base].date), this.cachePeriod)
      )
    },
    persistCachePeriod() {
      localStorage.setItem('sk-currency-cache', this.cachePeriod)
    },
    setBase(base) {
      this.pickedBase = base
      this.retrieveRates(base)
    },
    setTarget(target) {
      this.pickedTarget = target
    },
    async switchBase() {
      // nothing fancy
      {
        // let's wait until we have the new values to swap the grid
        let temp = this.pickedBase
        await this.retrieveRates(this.pickedTarget)
        this.pickedBase = this.pickedTarget
        this.pickedTarget = temp
      }
    }
  }
}
</script>

<template>
  <div class="hello">
    <h1>Currency Converter</h1>
    <div class="hello_content">
      <div class="hello_converter">
        <div class="hello_converter_rates">
          <div class="hello_converter_element">
            <h2>Base Currency</h2>
            <sk-select
              v-model="pickedBase"
              @change="retrieveRates(pickedBase)"
              placeholder="Pick a currency"
            >
              <sk-option
                v-for="(rate, base) in retrievedRates"
                :disabled="base === pickedBase"
                :key="base"
                :label="base"
                :value="base"
              >
              </sk-option>
            </sk-select>
          </div>
          <div class="hello_converter_switch">
            <sk-button
              @click="switchBase"
              :loading="loading"
              icon="el-icon-sort"
              >Switch</sk-button
            >
          </div>
          <div class="hello_converter_element">
            <h2>Target Currency</h2>
            <sk-select v-model="pickedTarget" placeholder="Target currency">
              <sk-option
                v-for="(rate, base) in retrievedRates"
                :disabled="base === pickedTarget"
                :key="base"
                :label="base"
                :value="base"
              >
              </sk-option>
            </sk-select>
          </div>
        </div>
        <div class="hello_converter_calculator">
          <div class="hello_converter_calculator_input">
            <sk-input placeholder="Please input" v-model="calculator.input">
              <template slot="prepend">{{ pickedBase }}</template>
            </sk-input>
          </div>
          <div class="hello_converter_calculator_ouput">
            <sk-input
              placeholder="Please input"
              :value="calculatorOuputFormatted"
              readonly
            >
              <template slot="prepend">{{ pickedTarget }}</template>
            </sk-input>
          </div>
        </div>
        <div class="hello_converter_refresh">
          <h2>Save data</h2>
          <h3>
            Do local currency swapping if the currencies are retrieved less than
            {{ cachePeriod === -1 ? 'X' : cachePeriod }} day(s) ago
          </h3>
          <sk-select
            @change="persistCachePeriod"
            v-model="cachePeriod"
            placeholder="Pick a "
          >
            <sk-option
              v-for="cachePeriod in cachePeriods"
              :key="cachePeriod.value"
              :label="cachePeriod.label"
              :value="cachePeriod.value"
            >
            </sk-option>
          </sk-select>
          <sk-button
            type="default"
            icon="el-icon-refresh"
            :loading="loading"
            @click="retrieveRates(pickedBase)"
            >Refresh rates</sk-button
          >
        </div>
      </div>
      <div class="hello_rates">
        <div
          v-for="(rate, target) in retrievedRates"
          :key="rate"
          @click="setTarget(target)"
          class="hello_rates_rate"
        >
          <div class="hello_rates_rate_base">{{ target }}</div>
          <div class="hello_rates_rate_value">{{ rate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.hello {
  max-width: 1400px;
  display: flex;
  min-height: 100%;
  flex-direction: column;

  &_content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px;
  }

  &_rates {
    // I am using a grid to prevent the weird behaviour on the last lines. Of course,
    // for compatibility reasons I would go with flex-wrap (easier)
    display: grid;
    flex: 1;
    margin: 40px;
    max-width: 600px;
    min-width: 300px;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
    background-color: #eeeeee;

    &_rate {
      flex: 1 1 100px;
      cursor: pointer;
      &:hover {
        background-color: #dddddd;
      }

      &_base {
        color: #5b5b5b;
        text-transform: uppercase;
      }

      &_vale {
        color: #c0c0c0;
      }
    }
  }

  &_converter {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    flex: 1;
    margin: 40px;

    &_rates {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      margin-bottom: 40px;
    }

    &_element {
      margin: 10px;
    }

    &_switch {
      margin: 10px;
    }

    &_refresh {
      margin-top: 40px;
      border: 1px dashed rgba(0, 0, 0, 0.1);
      padding: 20px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      button {
        margin-top: 20px;
      }
    }
  }
}
</style>
