---
layout: post
title: Laravel - Eloquent subqueries
tags: [laravel, sql]
---


Laravel uses eloquent for its database interactions. It has some great features and make queries super easy for the most part. Recently I ran into an issue with creating a subquery in one of my eloquent queries. I was trying to do a common query known as a greatest-n-per-group. Basically you want to get the most recent or largest of a group. To do this it is best to add a subquery on one of the joins to get the largest of that group. There is not functionality built in to do this in eloquent so you have to be a little clever. I was not able to find a solution that i liked to achieve this so i came up with something on my own.
```php
DB::table('users as u')
     ->select(DB::raw('u.id, u.name'))
     ->join('some_interesting_table as s', 's.user_id', 'u.id')
     ->leftJoin('another_intersting_table as a', function($join)
            {
                $join->on('a.user_id', '=', 'u.id');
                $join->on('a.id', '=',
                 DB::raw("(select max(id)
                 from another_intersting_table a2
                  where u.id = a2.user_id)"));
            })
    ->where('u.name', 'like', "%" . $name . "%")
    ->orderby('u.name');
```

