/**
 * Created by avallabhaneni on 8/2/2016.
 */
/*
 * @file index.js
 * Controller for manufacturing plant page.
 *
 * @author Avinash Vallabhaneni (avallabhaneni@foliage.com)
 * @version 0.01
 *
 * Copyright (c) 2015 ALTRAN All rights reserved.
 */

import constants from '../constants'

export default class ModalCtrl {
    constructor($scope,$uibModalInstance) {

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
}