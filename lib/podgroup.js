/*
 * Copyright 2016 Red Hat Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var artemis = require('./artemis.js');

function get(object, fields, default_value) {
    var o = object;
    for (var i = 0; o && i < fields.length; i++) {
        o = o[fields[i]];
    }
    return o || default_value;
};

function get_broker_port(pod) {
    return get(pod.ports, ['broker', 'amqp'], 5673);
};

function Pod(pod) {
    this.name = pod.name;
    this.broker = artemis.connect({'id':pod.name, 'host':pod.host, 'port':get_broker_port(pod)});
};

Pod.prototype.close = function () {
    this.broker.close();
};

function PodGroup() {
    this.pods = {};
};

PodGroup.prototype.update = function (latest) {
    var changed = false;
    var indexed = {};
    for (var i in latest) {
        var pod = latest[i];
        indexed[pod.name] = pod;
        if (this.pods[pod.name] === undefined) {
            this.added(pod);
            changed = true;
            console.log('added pod ' + JSON.stringify(pod));
        }
    }
    for (var name in this.pods) {
        if (indexed[name] === undefined) {
            this.removed_by_name(name)
            changed = true;
            console.log('removed pod named ' + name);
        }
    }
    return changed;
}

PodGroup.prototype.added = function (pod) {
    this.pods[pod.name] = new Pod(pod);
};

PodGroup.prototype.removed_by_name = function (podname) {
    //TODO: may be restarted, so should wait for a while before removing
    this.pods[podname].close();
    delete this.pods[podname];
};

PodGroup.prototype.removed = function (pod) {
    this.remove_by_name(pod.name);
};

PodGroup.prototype.pod_list = function () {
    var list = [];
    for (var i in this.pods) {
        list.push(this.pods[i]);
    }
    return list;
};

PodGroup.prototype.broker_list = function () {
    var list = [];
    for (var i in this.pods) {
        list.push(this.pods[i].broker);
    }
    return list;
};

PodGroup.prototype.close = function () {
    for (var p in this.pods) {
        this.pods[p].close();
    }
    this.pods = [];
};

module.exports = function () {
    return new PodGroup();
}
