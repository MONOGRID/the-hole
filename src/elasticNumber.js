export default class ElasticNumber {

  constructor(value) {
    this.value = value;
    this.target = value;
    this.speed = 3;
  }

  update(delta) {
    let dist = this.target - this.value;

    this.value += dist * (this.speed * Math.min(delta, 0.1));
  }
}
