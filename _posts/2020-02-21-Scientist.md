---
layout: post
title:  Science
tags: [experiments, ruby]
---

The scientist gem (https://github.com/github/scientist) is a great way to experiment and explore your system. I have recently introduced it
to Mavenlink and we have seen huge success in our ability to make scary changes to the system. 

So what is the scientist gem? The scientist gem is a way to run experiments in your system to better understand what 
would happen if you changed a critical path. It works by allowing you to call two methods, the current implementation, 
and the new experiment. The code is really simple it looks something like

``` Ruby
my_experiment = MyExperiment.new
my_experiment.use { trusty_old_method }   
my_experiment.try { my_new_method }   
my_experiment.run
```
This code will now run both of the blocks of code but only return the value from the `trusty_old_method`. The scientist
gem comes with a class you will need to override that allows you to collect your data and send it off to be examined. 
I am using New Relic to collect the data with custom events and it has been a joy! I am able to use New Relic's custom event
graphs and charts to see exactly what is going on with my experiment. I can set off alerts if an experiment fails which gives
me the ability to replace pieces of code while maintaining confidence in how the system works. 

The experiment class we are using looks something like

```
require "scientist/experiment"

class MyExperiment
  include Scientist::Experiment

  DEFAULT_PERCENT_ENABLED = Rails.env.test? ? 100 : 5

  attr_accessor :name, :percent_enabled

  def initialize(name:)
    @name = name
    @percent_enabled = configured_percent_enabled || DEFAULT_PERCENT_ENABLED
  end

  def enabled?
    percent_enabled > 0 && rand(100) < percent_enabled
  end

  def raised(operation, error)
    NewRelic::Agent.record_custom_event(name, { operation: operation, inspect: error.inspect })
  end

  def publish(result)
    timing_info = { experiment_time: result.candidates.first.duration, control_time: result.control.duration }

    if result.matched?
      NewRelic::Agent.record_custom_event(name, { success: true }.merge(timing_info))
    elsif result.mismatched?
      store_mismatch_data(result, timing_info)
    end
  end

  def store_mismatch_data(result, timing_info)
    payload = {
      name: name,
      context: context,
      control: observation_payload(result.control),
      candidate: observation_payload(result.candidates.first),
      execution_order: result.observations.map(&:name),
      success: false,
    }.merge(timing_info)

    NewRelic::Agent.record_custom_event(name, payload)
  end

  def observation_payload(observation)
    if observation.raised?
      {
        exception: observation.exception.class,
        message: observation.exception.message,
        backtrace: observation.exception.backtrace
      }
    else
      {
        value: observation.cleaned_value
      }
    end
  end

  private

  def configured_percent_enabled
    ExperimentConfiguration.find_by(name: name)&.percent_enabled
  end
end
```

There are a few fun things to point out. The method `configured_percent_enabled` allows us to dynamically change what percent
of experiments will run. This is really useful when we want to test load on a new method or if the method we are testing
only needs to run for a little bit. 

The `DEFAULT_PERCENT_ENABLED` is set up to always run for tests because we were running into intermittent failures in 
our test suite because of the inconsistent behavior from these experiments. 

The New Relic custom events we are sending over create a nice way for us to create dashboards and alerts to have an in depth 
view of what the experiment is doing.
