import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { getApi, isConnectionValid, processMessages } from './functions';
import { API, Connection } from './structs';
import { emptyConnection } from './structs/mocks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  public title = 'node-azure-servicebus-explorer-fe';
  public connection = emptyConnection;
  public isLoadingSavedConnections = false;
  public savedConnections: Connection[] = [];
  public isLoadingMessages = false;
  public messages: string[] = [];

  private subscriptions = new Subscription();
  private api: API;

  constructor(private http: HttpClient) {
    this.api = getApi(this.http);
  }

  public ngOnInit(): void {
    this.getSavedConnections();
    this.getMessages();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public addSavedConnection = (): void => {
    if (!isConnectionValid(this.connection)) {
      alert('Connection info is incomplete or invalid.');
      return;
    }
    const subscription = this.subscriptions.add(
      this.api
        .addSavedConnection(this.connection)
        .subscribe((response): void => {
          this.handleAddSavedConnectionResponse(response);
          this.unsubscribe(subscription);
        })
    );
  };

  private unsubscribe = (subscription: Subscription): void => {
    subscription.unsubscribe();
    this.subscriptions.remove(subscription);
  };

  private getSavedConnections = (): void => {
    this.savedConnections = [];
    this.isLoadingSavedConnections = true;
    const subscription = this.subscriptions.add(
      this.api.getSavedConnections().subscribe((savedConnections): void => {
        this.handleSavedConnections(savedConnections);
        this.unsubscribe(subscription);
        this.isLoadingSavedConnections = false;
      })
    );
  };

  private handleSavedConnections = (
    savedConnections: Connection[] = []
  ): void => {
    this.savedConnections = savedConnections;
  };

  private getMessages = (): void => {
    this.messages = [];
    this.isLoadingMessages = true;
    const subscription = this.subscriptions.add(
      this.api.getTopics().subscribe((messages): void => {
        this.handleMessages(messages);
        this.unsubscribe(subscription);
        this.isLoadingMessages = false;
      })
    );
  };

  private handleMessages = (messages: any[] = []): void => {
    this.messages = processMessages(messages);
  };

  private handleAddSavedConnectionResponse = (response: any): void => {
    this.getMessages();
  };
}
