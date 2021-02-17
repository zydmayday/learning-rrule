import pkg from 'rrule';
const { RRule, RRuleSet } = pkg;
import { performance } from 'perf_hooks';
import { writeFile } from 'fs';

const startDate = new Date(2021, 0, 1);
const endDate = new Date(2022, 11, 31);

// Check for the current time span
const startDateToCheck = new Date(Date.UTC(2021, 1, 17, 13, 34, 0, 0));
const endDateToCheck = new Date(Date.UTC(2021, 1, 17, 13, 39, 0, 0));

const benchmark = {
  generateRulesTime: [],
  filterRulesTime: [],
  filteredRulesNum: []
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomFromList = (xs) => {
  const random = getRandomInt(0, xs.length - 1);
  const item =  xs[random];
  return item;
}

function randomDate(start, end, startHour = 0, endHour = 24) {
  var date = new Date(+start + Math.random() * (end - start));
  var hour = startHour + Math.random() * (endHour - startHour) | 0;
  date.setHours(hour);
  return date;
}

const calcPerformance = (func, ...args) => {
  const start = performance.now();
  const res = func(...args);
  const end = performance.now();
  const time = end - start;
  console.log(`Executed took ${time} milliseconds for ${func.name}`)
  return [res, time];
}

const freqs = [
  RRule.YEARLY,
  RRule.MONTHLY,
  RRule.WEEKLY,
  RRule.DAILY,
  // RRule.HOURLY,
  // RRule.MINUTELY,
  // RRule.SECONDLY
]

const createRuleRandomly = () => {
  const dtstart = randomDate(startDate, endDate);
  return new RRule({
    freq: getRandomFromList(freqs),
    dtstart: dtstart,
    until: getRandomArbitrary(0, 1) > 0.5 ? undefined : randomDate(dtstart, endDate)
  });
}

const generateRules = num => {
  const rules = [];
  for (let i = 0; i < num; i++) {
    rules.push(createRuleRandomly());
  }
  return rules;
}

const filterRules = (rrules) => {
  return rrules.filter(rrule => rrule.between(startDateToCheck, endDateToCheck).length > 0);
}


const getBenchmark = () => {
  const [rrules, t1] = calcPerformance(generateRules, 100_000);
  benchmark.generateRulesTime.push(t1);
  const [filteredRules, t2] = calcPerformance(filterRules, rrules);
  benchmark.filterRulesTime.push(t2);
  benchmark.filteredRulesNum.push(filteredRules.length);
}

for (let i = 0; i < 5 * 60; i++) {
  getBenchmark();
}

writeFile('benchmark.json', JSON.stringify(benchmark), () => {});

console.log(`Generate Rules Min Time: ${Math.min(...benchmark.generateRulesTime)}`);
console.log(`Generate Rules Max Time: ${Math.max(...benchmark.generateRulesTime)}`);
console.log(`Generate Rules Avg Time: ${benchmark.generateRulesTime.reduce((x, y) => x + y, 0) / benchmark.generateRulesTime.length}`);

console.log(`Filter Rules Min Time: ${Math.min(...benchmark.filterRulesTime)}`);
console.log(`Filter Rules Max Time: ${Math.max(...benchmark.filterRulesTime)}`);
console.log(`Filter Rules Avg Time: ${benchmark.filterRulesTime.reduce((x, y) => x + y, 0) / benchmark.filterRulesTime.length}`);

console.log(`Filter Rules Min Count: ${Math.min(...benchmark.filteredRulesNum)}`);
console.log(`Filter Rules Max Count: ${Math.max(...benchmark.filteredRulesNum)}`);
console.log(`Filter Rules Avg Count: ${benchmark.filteredRulesNum.reduce((x, y) => x + y, 0) / benchmark.filteredRulesNum.length}`);