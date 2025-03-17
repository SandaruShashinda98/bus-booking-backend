import { Types } from 'mongoose';
import { detectModifications } from 'src/common/helpers/modifications.helper';

describe('Helper Functions', () => {
  describe('detectModifications', () => {
    it('should detect changes between two objects', () => {
      const oldObject = {
        name: 'John',
        age: 30,
        address: {
          street: 'Main St',
          city: 'New York',
        },
      };

      const newObject = {
        name: 'John',
        age: 31,
        address: {
          street: 'Broadway',
          city: 'New York',
        },
      };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        { field_name: 'age', old_value: '30', new_value: '31' },
        {
          field_name: 'address.street',
          old_value: 'Main St',
          new_value: 'Broadway',
        },
      ]);
    });

    it('should handle new fields', () => {
      const oldObject = { name: 'Alice' };
      const newObject = { name: 'Alice', age: 25 };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        { field_name: 'age', old_value: '', new_value: '25' },
      ]);
    });

    it('should handle removed fields', () => {
      const oldObject = { name: 'Bob', age: 40 };
      const newObject = { name: 'Bob' };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        { field_name: 'age', old_value: '40', new_value: '' },
      ]);
    });

    it('should handle ObjectId fields', () => {
      const oldId = new Types.ObjectId();
      const newId = new Types.ObjectId();
      const oldObject = { id: oldId };
      const newObject = { id: newId };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        {
          field_name: 'id',
          old_value: oldId.toString(),
          new_value: newId.toString(),
        },
      ]);
    });

    it('should handle Date fields', () => {
      const oldDate = new Date('2023-01-01');
      const newDate = new Date('2023-01-02');
      const oldObject = { date: oldDate };
      const newObject = { date: newDate };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        {
          field_name: 'date',
          old_value: oldDate.toString(),
          new_value: newDate.toString(),
        },
      ]);
    });

    it('should handle nested arrays', () => {
      const oldObject = { items: ['apple', 'banana'] };
      const newObject = { items: ['apple', 'orange', 'grape'] };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([
        { field_name: 'items.1', old_value: 'banana', new_value: 'orange' },
        { field_name: 'items.2', old_value: '', new_value: 'grape' },
      ]);
    });

    it('should ignore blocked keys', () => {
      const oldObject = { name: 'Test', _id: new Types.ObjectId(), __v: 0 };
      const newObject = { name: 'Test', _id: new Types.ObjectId(), __v: 1 };

      const modifications = detectModifications(newObject, oldObject);

      expect(modifications).toEqual([]);
    });
  });
});
