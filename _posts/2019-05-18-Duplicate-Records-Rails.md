---
layout: post
title:  Duplicate Records in Rails
tags: [rails, sql]
---

  Rails provides so many nice features that help you manage your data. One of those features is validates_uniqueness_of
  which is a really cool feature until you realize that it doesn't always work. This rails article
  https://api.rubyonrails.org/classes/ActiveRecord/Validations/ClassMethods.html#method-i-validates_uniqueness_of explains how race conditions
  can allow duplicate records to be inserted with the same values. This is a relatively rare thing to happen but if your site
  starts to have a lot of traffic the chances of these issues start becoming a reality. So how do we fix this issue,
  well they explain that adding a unique index in the database will fix the issue by throwing an `ActiveRecord::RecordNotUnique`
  exception. This is great but what happens when you already have bad data in your database? How can you fix these issues if
  you can add the index since you have invalid data? Even worse what if you can just go in and update the values. I ran into
  just this issue and here was my solution to getting the database to a valid state to add the index and leave data that
  was already in place.

  The validates_uniqueness_of method can be especially vulnerable to race conditions if the data you are trying to validate
  is in different tables. For example, if you had to ensure that a users pet had a unique name within the household. If you
  set up your data to have an owner table a house table and a pet table. A pet belongs to an owner and an owner a house. If
  you wanted to add a validation that the pet had a unique name in the house you would have to navigate through the owner table
  and then to the house to see if the pet had a unique name. This can cause issues because the reads on multiple tables really increase
  the time for a race condition. To fix this we need to first ensure that all data that must be unique is in the same table
  so we need to add a household id to our pet. This could be seen as an issue since this will denormalize your data since you
  could find a pets house through an owner. If you see this as an issue it is possible to extract this data into a separate
  table and delegate your pets uniqueness constraints to a household pet table. For this example, we are going to allow a little
  denormalization. So first we must add a migration that adds the household_id to the pet.

  ```ruby
  class AddUniquenessToPet < ActiveRecord::Migration
    def change
      add_column :pets, :household_id, :integer
      add_column :pets, :revision, :integer, default: 0, null: false
    end
  end
  ```

   If we already have bad data we also
  need to add a second column that ensures that the data is unique. We could call this column revision, iteration, variation or
  another name that makes sense for your domain. Once we add these two columns we can run the migration.

  The next step to create unique data is the run a script or "backfiller" to fill in the data that was missing. There will
  need to be two steps to fill the data, one to fill in the data that was missing for the household_id and another to fill
  in the revision. In addition to creating these scripts, we will also need to add some application code that adds the household
  to a pet when they are created. This will ensure that down the road we will always have the data we need to determine if
  the pet is unique.

  Fill in the pets household id with the following script that will go through and set the needed data on the pet table.
  ```ruby
   def self.run!
      Pet.
        where("household_id IS NULL").
        joins(:owner).
        update_all("pets.household_id = owner.household_id")
   end
  ```


  This next script will go through and find all of the pets that have duplicates. This groups each of the results that
  have more than one pet with the same name. This enables us to identify each of the pets in a house that has the same name.
  After we get all of the pets within the same house with the same name we iterate over them and add a revision to each of
  the pets. So now we can tell if this was Lassy 0 or Lassy 1.
  ```ruby
          result = ActiveRecord::Base.connection.execute(<<-SQL)
            SELECT household_id, name, revision
            FROM `pets`
            GROUP BY household_id, name, revision
            HAVING count(name) > 1
          SQL
          result.each do |household_id, name|
            duplicate_pets = Pet
              .where(name: name)
              .where(household_id: household_id)

             duplicate_pet.each_with_index do |current_pet, index|
              current_pet.update_column(:revision, index)
            end
  ```

  Once this script has been run we have unique rows and we can finally a uniqueness constraint. This is another rails migration
  that can be run once we have deployed the application code and the backfillers.
  ```ruby
  class PetUniqueness < ActiveRecord::Migration
    def change
      add_index :pets, [:household_id, :name, :revision], :unique => true
    end
  end
  ```
