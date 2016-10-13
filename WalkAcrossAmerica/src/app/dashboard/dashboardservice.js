/**
 * Created by avallabhaneni on 8/5/2016.
 */
import angular from 'angular';
import constants from '../constants'

export default class DashboardService {

    /**
     * The parametrized constructor for Dashboard service class.
     *
     * @param $http The $http Service.
     *
     */
    constructor($http) {
        this.$http = $http;
    }


    /**
     * Service method to get the site image.
     *
     *
     * @returns The name of the Site Image.
     */
        getSiteImage() {
        var hostname = window.location.hostname;
        var hostAddress = "http://" + hostname + ":8081"
        return this.$http.get(hostAddress+"/dashboard/sites?context=Plant")
            .then(response => {
                return response.data.list;
            });
    }


}
DashboardService.$inject = ['$http'];