'use strict'

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return 'Hi,' + person.firstName + ' ' + person.lastName;
}

let user = { firstName: 'Jack', lastName: 'White' };

console.log(greeter(user));
